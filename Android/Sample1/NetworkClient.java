
public class NetworkClient
{
    static final String TAG = NetworkClient.class.getSimpleName();
    public static final String AUTHENTICATE_URL = "authenticate";
    public static final String SIGNUP_URL = "users";
    public static final String SHIPPING_COST_URL = "shipping_cost";
    public static final String PAYMENT_STRIPE_URL = "payment/stripe";
    public static final String PAYMENT_PAYPAL_URL = "payment/paypal";

    public static final String CATEGORY_URL = "categories/35";
    public static final String ADDRESS_URL = "addresses";
    public static final String COUNTRIES_URL = "countries";
    public static final String ORDERS_URL = "orders";
    public static final String PROJECTS_URL = "projects";
    public static final String PROJECT_FILES_URL = "project-files";
    public static final String ARG_USERNAME = "username";
    public static final String ARG_PASSWORD = "password";
    public static final String ARG_ID = "id";
    public static final String SUFFIX_COMPLETE = "complete";
    public static final String RESET_PASS = "password-reset";
    public static final String KEY_EMAIL = "email";

    public static final MediaType JSON = MediaType.parse("application/json; charset=utf-8");

    public static final boolean SHOULD_LOG_RESPONSE = true;

    final String baseUrl;
    ErrorHandler errorHandler;
    OkHttpClient client;
    Gson gson = new Gson();

    String authToken = null;

    public NetworkClient(ErrorHandler errorHandler, OkHttpClient client, String baseUrl, String authToken)
    {
        this.errorHandler = errorHandler;
        this.client = client;
        this.baseUrl = baseUrl;
        this.authToken = authToken;
    }

    public AuthenticateResponse authenticate(String login, String pass)
    {
        if (!canDoHttp())
        {
            handleError(ErrorHandler.ERROR_CODE_NO_NETWORK, new Exception(ErrorHandler.ERROR_CODE_NO_NETWORK));
            return null;
        }
        Request.Builder builder = new Request.Builder();
        HashMap<String, Object> params = new HashMap<>();
        params.put(ARG_USERNAME, login);
        params.put(ARG_PASSWORD, pass);

        setUrl(builder, params, AUTHENTICATE_URL);
        setHeaders(builder);

        AuthenticateResponse authResp = fetchResponse(builder.get().build(), AuthenticateResponse.class);

        if (authResp != null && authResp.success)
        {
            this.authToken = authResp.accessToken;
            return authResp;
        } else
            return null;
    }


    public AuthenticateResponse signup(Registration registration)
    {
        if (!canDoHttp())
        {
            handleError(ErrorHandler.ERROR_CODE_NO_NETWORK, new Exception(ErrorHandler.ERROR_CODE_NO_NETWORK));
            return null;
        }
        Request.Builder builder = new Request.Builder();

        setUrl(builder, null, SIGNUP_URL);
        setHeaders(builder);

        RequestBody body = RequestBody.create(JSON, gson.toJson(registration));
        AuthenticateResponse authResp = fetchResponse(builder.post(body).build(), AuthenticateResponse.class);

        if (authResp != null && authResp.success)
        {
            this.authToken = authResp.accessToken;
            return authResp;
        } else
            return null;
    }

    public boolean resetPass(String login)
    {
        if (!canDoHttp())
        {
            handleError(ErrorHandler.ERROR_CODE_NO_NETWORK, new Exception(ErrorHandler.ERROR_CODE_NO_NETWORK));
            return false;
        }
        Request.Builder builder = new Request.Builder();

        HashMap<String, Object> params = new HashMap<>();
        params.put(KEY_EMAIL, login);

        setUrl(builder, null, RESET_PASS);
        setHeaders(builder);

        String reqBody;
        RequestBody body = RequestBody.create(JSON, reqBody = gson.toJson(params));
        Log.v(TAG, "Req body is " + reqBody);
        CommonResponse resp = fetchResponse(builder.post(body).build(), CommonResponse.class);
        if (resp != null && resp.success)
        {
            return true;
        } else
        {
            handleError(ErrorHandler.ERROR_CODE_WRONG_EMAIL, new Exception(ErrorHandler.ERROR_CODE_WRONG_EMAIL));
            return false;
        }
    }

    public float getShippingCost()
    {
        if (!canDoHttp())
        {
            handleError(ErrorHandler.ERROR_CODE_NO_NETWORK, new Exception(ErrorHandler.ERROR_CODE_NO_NETWORK));
            return 0f;//Float.NaN;
        }
        Request.Builder builder = new Request.Builder();

        setUrl(builder, null, SHIPPING_COST_URL);
        setHeaders(builder);

        ShippingCostResponse authResp = fetchResponse(builder.get().build(), ShippingCostResponse.class);

        if (authResp != null && authResp.success)
        {
            return authResp.shippingCost;
        } else
            return 0f;//Float.NaN;
    }

    private boolean canDoHttp()
    {
        return PBXApplication.getInstance().isNetworkConnected();
    }

    public Category getProductsCategory(String href)
    {
        if (!canDoHttp())
        {
            handleError(ErrorHandler.ERROR_CODE_NO_NETWORK, new Exception(ErrorHandler.ERROR_CODE_NO_NETWORK));
            return null;
        }
        Request.Builder builder = new Request.Builder();
        setUrl(builder, null, href);
        setHeaders(builder);

        ItemResponse<Category> catResp = fetchResponse(builder.get().build(),
                                                       new TypeToken<ItemResponse<Category>>()
                                                       {
                                                       }.getType());

        if (catResp != null && catResp.success)
        {
            return catResp.item;
        } else
            return null;
    }

    public List<Address> getAddressList(int page)
    {
        if (!canDoHttp())
        {
            handleError(ErrorHandler.ERROR_CODE_NO_NETWORK, new Exception(ErrorHandler.ERROR_CODE_NO_NETWORK));
            return null;
        }
        Request.Builder builder = new Request.Builder();

        HashMap<String, Object> params = new HashMap<>();
        int pageSize = 4;
        params.put("offset", String.valueOf(page* pageSize));
        params.put("limit", String.valueOf(pageSize));
        setUrl(builder, params, ADDRESS_URL);
        setHeaders(builder);

        ListResponse<Address> addrResp = fetchResponse(builder.get().build(),
                                                       new TypeToken<ListResponse<Address>>()
                                                       {
                                                       }.getType());

        if (addrResp != null && addrResp.success)
        {
            return addrResp.items;
        } else
            return null;
    }

    public List<Country> getCountryList()
    {
        if (!canDoHttp())
        {
            handleError(ErrorHandler.ERROR_CODE_NO_NETWORK, new Exception(ErrorHandler.ERROR_CODE_NO_NETWORK));
            return null;
        }
        Request.Builder builder = new Request.Builder();

        setUrl(builder, null, COUNTRIES_URL);
        setHeaders(builder);

        ListResponse<Country> countryResp = fetchResponse(builder.get().build(),
                                                          new TypeToken<ListResponse<Country>>()
                                                          {
                                                          }.getType());

        if (countryResp != null && countryResp.success)
        {
            return countryResp.items;
        } else
            return null;
    }


    public Long postAddress(Address address)
    {
        if (!canDoHttp())
        {
            handleError(ErrorHandler.ERROR_CODE_NO_NETWORK, new Exception(ErrorHandler.ERROR_CODE_NO_NETWORK));
            return null;
        }
        Request.Builder builder = new Request.Builder();

        setUrl(builder, null, ADDRESS_URL, address.id);
        setHeaders(builder);

        RequestBody body = RequestBody.create(JSON, gson.toJson(address));
        if (address.id != null)
        {
            builder.put(body);
        } else
        {
            builder.post(body);
        }
        UpdateResponse resp = fetchResponse(builder.build(),
                                            UpdateResponse.class);

        if (resp != null && resp.success)
        {
            return resp.id;
        } else
            return null;
    }

    public boolean deleteAddress(long addressId)
    {
        if (!canDoHttp())
        {
            handleError(ErrorHandler.ERROR_CODE_NO_NETWORK, new Exception(ErrorHandler.ERROR_CODE_NO_NETWORK));
            return false;
        }
        Request.Builder builder = new Request.Builder();

        setUrl(builder, null, ADDRESS_URL, addressId);
        setHeaders(builder);

        return consumeResponse(builder.delete().build());
    }

    public boolean deleteAddresses(long[] addressId)
    {
        if (!canDoHttp())
        {
            handleError(ErrorHandler.ERROR_CODE_NO_NETWORK, new Exception(ErrorHandler.ERROR_CODE_NO_NETWORK));
            return false;
        }
        Request.Builder builder = new Request.Builder();

        HashMap<String, Object> params = new HashMap<>();
        params.put(ARG_ID, addressId);
        setUrl(builder, params, ADDRESS_URL);
        setHeaders(builder);

        return consumeResponse(builder.delete().build());
    }

    public List<Purchase> getPurchasesList(int page)
    {
        if (!canDoHttp())
        {
            handleError(ErrorHandler.ERROR_CODE_NO_NETWORK, new Exception(ErrorHandler.ERROR_CODE_NO_NETWORK));
            return null;
        }
        Request.Builder builder = new Request.Builder();

        HashMap<String, Object> params = new HashMap<>();
        int pageSize = 20;
        params.put("offset", String.valueOf(page * pageSize));
        params.put("limit", String.valueOf(pageSize));
        setUrl(builder, params, ORDERS_URL);
        setHeaders(builder);

        ListResponse<Purchase> purchaseListResponse = fetchResponse(builder.get().build(),
                                                                    new TypeToken<ListResponse<Purchase>>()
                                                                    {
                                                                    }.getType());

        if (purchaseListResponse != null && purchaseListResponse.success)
        {
            return purchaseListResponse.items;
        } else
            return null;
    }

    public PurchaseDetails getPurchaseDetails(long id)
    {
        if (!canDoHttp())
        {
            handleError(ErrorHandler.ERROR_CODE_NO_NETWORK, new Exception(ErrorHandler.ERROR_CODE_NO_NETWORK));
            return null;
        }
        Request.Builder builder = new Request.Builder();

        setUrl(builder, null, ORDERS_URL, id);
        setHeaders(builder);

        ItemResponse<PurchaseDetails> purchase = fetchResponse(builder.get().build(),
                                                               new TypeToken<ItemResponse<PurchaseDetails>>()
                                                               {
                                                               }.getType());

        if (purchase != null && purchase.success)
        {
            return purchase.item;
        } else
            return null;
    }

    public ProjectUploadResponse openProjectUpload(ProjectUpload upload)
    {
        if (!canDoHttp())
        {
            handleError(ErrorHandler.ERROR_CODE_NO_NETWORK, new Exception(ErrorHandler.ERROR_CODE_NO_NETWORK));
            return null;
        }
        Request.Builder builder = new Request.Builder();

        setUrl(builder, null, PROJECTS_URL);
        setHeaders(builder);

        String bodyText;
        RequestBody body = RequestBody.create(JSON, bodyText = gson.toJson(upload));
        Log.d(TAG, "Body text: " + bodyText);

        ProjectUploadResponse resp = fetchResponse(builder.post(body).build(),
                                                   ProjectUploadResponse.class);

        if (resp != null && resp.success)
        {
            return resp;
        } else
            return null;
    }


    public String completeProjectUpload(String projectHash)
    {
        if (!canDoHttp())
        {
            handleError(ErrorHandler.ERROR_CODE_NO_NETWORK, new Exception(ErrorHandler.ERROR_CODE_NO_NETWORK));
            return null;
        }
        Request.Builder builder = new Request.Builder();

        setUrl(builder, null, PROJECTS_URL, projectHash);
        setHeaders(builder);

        RequestBody body = RequestBody.create(JSON, "");

        ProjectUploadResponse resp = fetchResponse(builder.put(body).build(),
                                                   ProjectUploadResponse.class);

        if (resp != null && resp.success)
        {
            return resp.hash;
        } else
            return null;
    }

    public ProjectFileUploadResponse openProjectFileUpload(ProjectFile projectFile)
    {
        if (!canDoHttp())
        {
            handleError(ErrorHandler.ERROR_CODE_NO_NETWORK, new Exception(ErrorHandler.ERROR_CODE_NO_NETWORK));
            return null;
        }
        Request.Builder builder = new Request.Builder();

        setUrl(builder, null, PROJECT_FILES_URL);
        setHeaders(builder);

        String bodyText;
        RequestBody body = RequestBody.create(JSON, bodyText = gson.toJson(projectFile));
        Log.d(TAG, "Body text: " + bodyText);

        ProjectFileUploadResponse resp = fetchResponse(builder.post(body).build(),
                                                       ProjectFileUploadResponse.class);

        if (resp != null && resp.success)
        {
            return resp;
        } else
            return null;
    }

    public String completeProjectFileUpload(String projectHash)
    {
        if (!canDoHttp())
        {
            handleError(ErrorHandler.ERROR_CODE_NO_NETWORK, new Exception(ErrorHandler.ERROR_CODE_NO_NETWORK));
            return null;
        }
        Request.Builder builder = new Request.Builder();

        setUrl(builder, null, PROJECT_FILES_URL, projectHash);
        setHeaders(builder);

        RequestBody body = RequestBody.create(JSON, "");

        ProjectUploadResponse resp = fetchResponse(builder.put(body).build(),
                                                   ProjectUploadResponse.class);

        if (resp != null && resp.success)
        {
            return resp.hash;
        } else
            return null;
    }


    protected <R extends CommonResponse> R fetchResponse(Request request, Type responseClass)
    {
        try
        {
            Response response = client.newCall(request).execute();
            ResponseBody body = response.body();
            String bodyString = body.string();
            if (SHOULD_LOG_RESPONSE)
            {
                Log.v(TAG, "Response is " + bodyString);
            }
            R parserResp = gson.fromJson(bodyString, responseClass);
            if (response.isSuccessful())
            {
                return parserResp;
            } else
            {
                handleError(parserResp.error_code, new Exception(parserResp.error_code),
                            responseClass.equals(AuthenticateResponse.class), parserResp.error);
            }
        }
        catch (IOException e)
        {
            Log.w(TAG, "Exception on network call");
            handleError(ErrorHandler.ERROR_CODE_IO, e);
        }
        return null;
    }

    protected boolean consumeResponse(Request request)
    {
        try
        {
            Response response = client.newCall(request).execute();
            if (SHOULD_LOG_RESPONSE)
            {
                Log.v(TAG, "Response is " + (response.isSuccessful() ? "successful" : "failed"));
            }
            if (response.isSuccessful())
            {
                return true;
            } else
            {
                // TODO: how to handle delete errors?
//                handleError(parserResp.error_code, new Exception(parserResp.error_code),
//                        responseClass.equals(AuthenticateResponse.class));
                return false;
            }
        }
        catch (IOException e)
        {
            Log.w(TAG, "Exception on network call");
            handleError(ErrorHandler.ERROR_CODE_IO, e);
        }
        return false;
    }

    private void handleError(String errorCode, Exception e)
    {
        handleError(errorCode, e, false);
    }

    private void handleError(String errorCode, Exception e, boolean loginRelated)
    {
        handleError(errorCode, e, loginRelated, null);
    }

    private void handleError(String errorCode, Exception e, boolean loginRelated, String error)
    {
        Log.w(TAG, errorCode, e);
        this.errorHandler.handle(errorCode, loginRelated, error);
    }

    void setUrl(Request.Builder builder, HashMap<String, Object> params, Object... urlSegment)
    {
        Uri.Builder uri = new Uri.Builder();
        uri.encodedPath(baseUrl);
        for (Object segment : urlSegment)
        {
            if (segment != null)
            {
                uri.appendEncodedPath(segment.toString());
            }
        }
        if (params != null)
        {
            for (Map.Entry<String, Object> entry : params.entrySet())
            {
                Object value = entry.getValue();
                if (value.getClass().isArray())
                {
                    if (value instanceof Object[])
                    {
                        Object[] values = ((Object[]) value);
                        for (Object v : values)
                        {
                            uri.appendQueryParameter(entry.getKey(), v.toString());
                        }
                    } else if (value instanceof long[])
                    {
                        long[] values = ((long[]) value);
                        for (long v : values)
                        {
                            uri.appendQueryParameter(entry.getKey(), Long.toString(v));
                        }
                    }
                } else
                {
                    uri.appendQueryParameter(entry.getKey(), value.toString());
                }
            }
        }
        builder.url(uri.toString());
        Log.v(TAG, "Uri set to " + uri.toString());
    }

    public void setHeaders(Request.Builder builder)
    {
        builder.addHeader("Accept-Language", "en");
        builder.addHeader("Connection", "Keep-Alive");
        builder.addHeader("Content-Type", "application/json");
        if (authToken != null)
        {
            builder.addHeader("access-token", authToken);
        }
    }

    public String getAuthToken()
    {
        return authToken;
    }

    public void logout()
    {
        this.authToken = null;
    }

    public boolean upload(ProjectFileUploadResponse pfu, File targ, String mime,
                          CountingRequestBody.Listener progressListener)
    {
        if (!canDoHttp())
        {
            handleError(ErrorHandler.ERROR_CODE_NO_NETWORK, new Exception(ErrorHandler.ERROR_CODE_NO_NETWORK));
            return false;
        }
        Request.Builder builder = new Request.Builder();

        builder.url(pfu.url);

        for (Map.Entry<String, String> entry : pfu.headers.entrySet())
        {
            builder.addHeader(entry.getKey(), entry.getValue());
        }

        RequestBody body = new CountingRequestBody(RequestBody.create(MediaType.parse(mime), targ), progressListener);

        try
        {
            Request request = builder.put(body).build();
            Response response = client.newCall(request).execute();
            ResponseBody body1 = response.body();
            Log.v(TAG, "Url is " + request.urlString());
            Log.v(TAG, "Req Headers " + request.headers());
            String bodyString = body1.string();
            if (SHOULD_LOG_RESPONSE)
            {
                Log.v(TAG, "Resp Headers " + response.headers());
                Log.v(TAG, "Resp Body len is " + body1.contentLength());
                Log.v(TAG, "Response is " + bodyString);
            }
            return true;
        }
        catch (IOException e)
        {
            Log.w(TAG, "Exception on network call");
            handleError(ErrorHandler.ERROR_CODE_IO, e);
            return false;
        }
    }

    public Long publishOrder(PublishOrder publishOrder)
    {
        if (!canDoHttp())
        {
            handleError(ErrorHandler.ERROR_CODE_NO_NETWORK, new Exception(ErrorHandler.ERROR_CODE_NO_NETWORK));
            return null;
        }
        Request.Builder builder = new Request.Builder();

        setUrl(builder, null, ORDERS_URL);
        setHeaders(builder);

        String req;
        RequestBody body = RequestBody.create(JSON, req = gson.toJson(publishOrder));
        Log.v(TAG, "Req body is " + req);
        UpdateResponse resp = fetchResponse(builder.post(body).build(),
                                            UpdateResponse.class);

        if (resp != null && resp.success)
        {
            return resp.id;
        } else
            return null;
    }

    public boolean confirmPaymentStripe(Token token, long orderId)
    {
        if (!canDoHttp())
        {
            handleError(ErrorHandler.ERROR_CODE_NO_NETWORK, new Exception(ErrorHandler.ERROR_CODE_NO_NETWORK));
            return false;
        }
        Request.Builder builder = new Request.Builder();

        setUrl(builder, null, PAYMENT_STRIPE_URL);
        setHeaders(builder);

        StripePayment payment = new StripePayment(orderId, token.getId());
        String reqBody;
        RequestBody body = RequestBody.create(JSON, reqBody = gson.toJson(payment));
        Log.v(TAG, "Req body is " + reqBody);

        CommonResponse resp = fetchResponse(builder.post(body).build(),
                                            CommonResponse.class);

        if (resp == null) return false;
        if (resp.success)
        {
            return true;
        } else
        {
            handleError(resp.error_code, new Exception(resp.error_code));
            return false;
        }
    }

    public boolean confirmPaymentPaypal(PaymentConfirmation paymentConfirmation, long orderId)
    {
        if (!canDoHttp())
        {
            handleError(ErrorHandler.ERROR_CODE_NO_NETWORK, new Exception(ErrorHandler.ERROR_CODE_NO_NETWORK));
            return false;
        }
        Request.Builder builder = new Request.Builder();

        setUrl(builder, null, PAYMENT_PAYPAL_URL);
        setHeaders(builder);

        PaypalPayment payment = new PaypalPayment(orderId, paymentConfirmation.getProofOfPayment().getPaymentId());
        String reqBody;
        RequestBody body = RequestBody.create(JSON, reqBody = gson.toJson(payment));
        Log.v(TAG, "Req body is " + reqBody);

        CommonResponse resp = fetchResponse(builder.post(body).build(),
                                            CommonResponse.class);

        if (resp == null) return false;
        if (resp.success)
        {
            return true;
        } else
        {
            handleError(resp.error_code, new Exception(resp.error_code));
            return false;
        }
    }

    public OkHttpClient getHttpClient() {
        return client;
    }
}
