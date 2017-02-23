
public class UploadService extends IntentService
{
    //data
    protected PBXApplication d = PBXApplication.getInstance();

    //logs
    static final String LOG_TAG = UploadService.class.getSimpleName();

    //statics
    public static final String ACTION_UPLOAD_PROGRESS_UPDATE = "action.upload.progress.update";
    public static final String EXTRA_POSITION = "extra.position";
    public static final String EXTRA_PROGRESS = "extra.progress";
    public static final int NOTIFICATION_ID = 34;

    private final Handler handler;

    private List<Project> _projectList;
    private LocalBroadcastManager _broadcastManager;
    private NotificationCompat.Builder _notificationBuilder;
    private NotificationManager _notificationManager;

    //progress
    private int[] _progresses;
    private int _currentIdx;
    private int _progressDone;
    private long _totalSize;
    private long _sizeProcessed;

    public UploadService()
    {
        super("UploadService");
        handler = new Handler();
    }

    @Override
    protected void onHandleIntent(Intent intent)
    {
        Log.d(LOG_TAG, "[Start uploading]");

        Address address = (Address) intent.getSerializableExtra(UploadActivity.EXTRA_ADDRESS);
        Storage storage = d.getStorage();

        _projectList = storage.getProjectsList();
        _broadcastManager = LocalBroadcastManager.getInstance(this);

        Intent i = new Intent(this, UploadActivity.class);
        i.putExtra(UploadActivity.EXTRA_ADDRESS, address);
        i.setFlags(
                Intent.FLAG_ACTIVITY_BROUGHT_TO_FRONT | Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        PendingIntent pi = PendingIntent.getActivity(this, 0, i, 0);
        _notificationManager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        _notificationBuilder = new NotificationCompat.Builder(this);
        _notificationBuilder.setContentTitle(getString(R.string.upload_notification_title))
                .setContentText(getString(R.string.upload_notification_content))
                .setSmallIcon(R.mipmap.ic_launcher)
                .setContentIntent(pi);


        File root = new File(d.getFilesDir(), d.getUserId() + ".upload");
        List<OrderItem> items = new ArrayList<>();

        _progresses = new int[_projectList.size()];

        try
        {
            for (int position = 0; position < _projectList.size(); position++)
            {
                Project project = _projectList.get(position);
                _currentIdx = position;

                OrderItem orderItem = uploadProject(root, project);

                items.add(orderItem);

                Log.d(LOG_TAG, position + " DONE!!!");
            }

            NetworkClient networkClient = d.getNetworkClient();
            Long id = networkClient.publishOrder(new PublishOrder(address.id, items));
            if (id != null)
                d.getPrefsManager().saveCurrentOrderId(id).commit();
            else
                throw new IOException("Server communication error");
        }
        catch (NoSuchAlgorithmException e)
        {
            Log.w(LOG_TAG, "Error creating digest. Aborting...", e);
            ErrorHandler.handle(this, ErrorHandler.ERROR_HASH_FUNCTION_ERROR);
            publishError(e);

            publishFinished(false);
            d.setUploadingInProgress(false);
            return;
        }
        catch (IOException e)
        {
            Log.w(LOG_TAG, "IO Exception. Aborting...", e);
            ErrorHandler.handle(this, ErrorHandler.ERROR_CODE_IO);
            publishError(e);

            publishFinished(false);
            d.setUploadingInProgress(false);
            return;
        }
        catch (Exception e)
        {
            Log.w(LOG_TAG, "Ok, I didn't expect this...", e);
            ErrorHandler.handle(this, ErrorHandler.ERROR_CODE_IO);
            publishError(e);

            publishFinished(false);
            d.setUploadingInProgress(false);
            return;
        }

        publishProgress(_projectList.size() - 1, _progresses);
        d.setUploadingInProgress(false);
    }

    @NonNull
    private OrderItem uploadProject(File root, Project project) throws IOException, NoSuchAlgorithmException
    {
        int idx = _currentIdx;
        _progressDone = 0;
        _sizeProcessed = 0;
        _totalSize = 0;
        _progresses[idx] = calcProgress();
        publishProgress(idx, _progresses);

        // Make project dir and list of files
        File projectDir = new File(root, project.title + project.id);
        projectDir.mkdirs();

        // Open upload
        Log.d(LOG_TAG, "[Open upload]");
        ProjectUpload upload = new ProjectUpload(project.product.id);
        ProjectUploadResponse uploadResponse = d.getNetworkClient().openProjectUpload(upload);

        // Create metadata json
        ProjectVO projectData = new ProjectVO();
        projectData.hash = uploadResponse.hash;
        projectData.themeHash = project.darkFrame ? project.product.black_theme : project.product.white_theme;
        projectData.name = project.title;
        File jsonFile = new File(projectDir, "project_config.json");
        jsonFile.createNewFile();

        // Calculating total size
        File cover = d.getFileForProject(project);
        _totalSize += cover.length();
        _totalSize += jsonFile.length();
        for (int i = 0; i < project.pictures.size(); i++)
        {
            Picture pic = project.pictures.get(i);
            File file = new File(pic.url);
            _totalSize += file.length();
        }

        //upload cover
        Log.d(LOG_TAG, "[Upload cover]");
        File targ = new File(projectDir, "thumb.jpg");
        Utilities.copy(cover, targ);
        uploadFile(targ, uploadResponse.hash, "image/jpeg");
        _progresses[idx] = calcProgress();
        publishProgress(idx, _progresses);

        //upload pictures
        Log.d(LOG_TAG, "[Upload pictures]");
        List<File> files = copyPictures(project, projectDir);
        for (int i = 0; i < project.pictures.size(); i++)
        {
            String hash = uploadFile(files.get(i), uploadResponse.hash, "image/jpeg").hash;
            projectData.images.add(hash);
            _progresses[idx] = calcProgress();
            publishProgress(idx, _progresses);
            if (project.product.product_type == ProductType.PHOTOBOOK)
            {
                for (int j = 0; j < project.coverPictures.size(); j++)
                {
                    if (project.pictures.get(i).id == project.coverPictures.get(j))
                        projectData.coverImages.add(hash);
                }
            }
        }

        //create and upload json
        Log.d(LOG_TAG, "[Create and upload json]");
        Gson gson = new Gson();
        String projectJson = gson.toJson(projectData);
        FileWriter fileWriter = new FileWriter(jsonFile);
        try
        {
            fileWriter.write(projectJson);
            Log.d(LOG_TAG, "Successfully Copied JSON Object to File...");
            Log.d(LOG_TAG, "\nJSON Object: " + projectJson);
        }
        catch (IOException e)
        {
            e.printStackTrace();

        }
        finally
        {
            fileWriter.flush();
            fileWriter.close();
        }

        uploadFile(jsonFile, uploadResponse.hash, "application/json");
        _progresses[idx] = calcProgress();
        publishProgress(idx, _progresses);

        // Complete upload
        Log.d(LOG_TAG, "[Finish upload]");
        d.getNetworkClient().completeProjectUpload(uploadResponse.hash);

        OrderItem orderItem = new OrderItem(
                project.product.id,
                project.amount,
                uploadResponse.hash,
                project.title);

        // Cleanup
        Log.d(LOG_TAG, "[Cleanup]");
        cleanup(projectDir, files);
        _progresses[idx] = 100;
        publishProgress(idx, _progresses);
        return orderItem;
    }

    private ProjectFileUploadResponse uploadFile(File targ, String hash, String mimetype) throws NoSuchAlgorithmException, IOException
    {
        Log.d(LOG_TAG, "[Compute md5 checksum]");
        String hexMD5 = Utilities.getMd5(targ);

        Log.d(LOG_TAG, "[Compute sha256 checksum]");
        String hexSHA256 = Utilities.getSha256(targ);

        Log.d(LOG_TAG, "[Requesting credentials]");
        ProjectFileUploadResponse pfu = d.getNetworkClient().openProjectFileUpload(
                new ProjectFile(targ.getName(), hash, hexMD5, hexSHA256, targ.length(), mimetype));

        Log.d(LOG_TAG, "[Uploading to s3]");
        boolean success = d.getNetworkClient().upload(pfu, targ, mimetype,
                                                      new CountingRequestBody.Listener()
                                                      {
                                                          @Override
                                                          public void onRequestProgress(long bytesWritten, long contentLength)
                                                          {
                                                          }
                                                      });

        Log.d(LOG_TAG, "[S3 upload success: " + success + "]");
        if (success)
        {
            d.getNetworkClient().completeProjectFileUpload(pfu.hash);
        }
        else
        {
            throw new IOException("Server communication error");
        }
        _sizeProcessed += targ.length();
        return pfu;
    }

    //----------------------------------
    //  Progress
    //----------------------------------
    private int calcProgress()
    {
        return (int) (_sizeProcessed / (float) _totalSize * 100f);
    }

    private void publishProgress(final int position, final int[] progresses)
    {
        if (progresses[position] == _progressDone)
        {
            return;
        }
        else
        {
            _progressDone = progresses[position];
        }
        Intent intent = new Intent(ACTION_UPLOAD_PROGRESS_UPDATE);
        intent.putExtra(EXTRA_POSITION, position);
        intent.putExtra(EXTRA_PROGRESS, progresses);
        _broadcastManager.sendBroadcast(intent);

        float p = ((float) position) / progresses.length;
        if (position < progresses.length)
        {
            p += (progresses[position] / 100f / progresses.length);
        }
        _notificationBuilder.setProgress(100, (int) (p * 100), false);
        _notificationManager.notify(NOTIFICATION_ID, _notificationBuilder.build());
    }

    private void publishFinished(boolean success)
    {
        if (success)
        {
            _notificationBuilder.setAutoCancel(true)
                    .setContentText(getString(R.string.upload_notification_content_done));
            _notificationManager.notify(NOTIFICATION_ID, _notificationBuilder.build());
        }
        else
        {
            _notificationManager.cancel(NOTIFICATION_ID);
        }
    }

    //----------------------------------
    //  Copy files
    //----------------------------------
    @NonNull
    private List<File> copyPictures(Project project, File projectDir) throws IOException
    {
        // Transform pictures
        List<File> files = new ArrayList<>(project.pictures.size());
        for (int i = 0; i < project.pictures.size(); i++)
        {
            Picture pic = project.pictures.get(i);
            String picName = i + ".jpg";

            files.add(compressPicture(projectDir, pic, picName));
        }
        return files;
    }

    //----------------------------------
    //  Dispose
    //----------------------------------
    private void cleanup(File projectDir, List<File> files)
    {
        for (int i = 0; i < files.size(); i++)
        {
            files.get(i).delete();
        }
        projectDir.delete();
    }

    //----------------------------------
    //  Error
    //----------------------------------
    private void publishError(final Exception e)
    {
        final StringWriter sw = new StringWriter();
        PrintWriter pw = new PrintWriter(sw);
        e.printStackTrace(pw);

        handler.post(new Runnable()
        {
            @Override
            public void run()
            {
                Toast.makeText(UploadService.this, sw.toString(), Toast.LENGTH_LONG).show();
            }
        });
    }

    //----------------------------------
    //  Helpers
    //----------------------------------
    private File compressPicture(File projectDir, Picture picture, String picName) throws IOException
    {
        File targetImageFile = new File(projectDir, picName);

        if (picture.type == Picture.TYPE_LOCAL)
        {
           Utilities.copy(new File(picture.url), targetImageFile);
        }
        else
        {
            URL url = new URL(picture.url);
            InputStream in = new BufferedInputStream(url.openStream());
            OutputStream out = new BufferedOutputStream(new FileOutputStream(targetImageFile));
            Utilities.copy(in, out);
        }
        return targetImageFile;
    }


}
