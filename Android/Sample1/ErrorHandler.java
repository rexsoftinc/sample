
public class ErrorHandler {

    public static final String ACTION_SNACKBAR_NOTIFICATION = "action.snackbar.notification";

    public static final String ERROR_CODE_IO = "io";
    public static final String ERROR_CODE_NO_NETWORK = "no_network";
    public static final String ERROR_CODE_INVALID_CREDENTIALS = "authentication_needed";
    public static final String ERROR_VALIDATION = "ValidationError";

    //Stripe errors
    public static final String ERROR_STRIPE_CARD_DECLINED = "card_declined"; //: Use this special card number - 4000000000000002."
    public static final String ERROR_STRIPE_CARD_NUMBER_INCORRECT = "incorrect_number";// Use a number that fails the Luhn check, e.g. 4242424242424241.\n" +
    public static final String ERROR_STRIPE_CARD_INVALID_MONTH = "invalid_expiry_month";// Use an invalid month e.g. 13.\n" +
    public static final String ERROR_STRIPE_CARD_INVALID_YEAR = "invalid_expiry_year";// Use a year in the past e.g. 1970.\n" +
    public static final String ERROR_STRIPE_CARD_INVALID_CVC = "invalid_cvc";

    public static final String ERROR_HASH_FUNCTION_ERROR = "NoSuchAlgorithmException";
    public static final String KEY_EMAIL = "email";
    public static final String ERROR_CODE_WRONG_EMAIL = "wrong_email";
    final Context context;

    public ErrorHandler(Context context) {
        this.context = context;
    }

    public void handle(String errorCode) {
        handle(context, errorCode, false);
    }

    public static void handle(Context context, String errorCode) {
        handle(context, errorCode, false);
    }

    public static void handle(Context context, String errorCode, boolean loginRelated) {
        handle(context, errorCode, loginRelated, null);
    }

    public static void handle(Context context, String errorCode, String customErrorText) {
        handle(context, errorCode, false, customErrorText);
    }

    public static void handle(Context context, String errorCode, boolean loginRelated, String customErrorText) {
        SnackbarPayload sp = new SnackbarPayload();
        sp.notification = context.getString(R.string.error_internal_server_error);
        if (errorCode == null) {
            sp.notification = customErrorText;
            sp.autoclose = 3000;
        } else if (ERROR_VALIDATION.equals(errorCode)) {
            Gson gson = new Gson();
            TypeToken<HashMap<String, String[]>> typeToken = new TypeToken<HashMap<String, String[]>>() {
            };
            HashMap<String, String[]> errorMap = gson.fromJson(customErrorText, typeToken.getType());
            if (errorMap.containsKey(KEY_EMAIL)) {
                sp.notification = errorMap.get(KEY_EMAIL)[0];
            }
            sp.autoclose = 3000;
        } else if (ERROR_CODE_IO.equals(errorCode)) {
            sp.notification = context.getString(R.string.error_connection_interrupted);
            sp.actionText = context.getString(R.string.action_close);
        } else if (ERROR_CODE_NO_NETWORK.equals(errorCode)) {
            sp = new SnackbarPayload() {
                @Override
                public void onActionClick(SnackBar snackBar, int i) {
                    snackBar.getContext().startActivity(new Intent(Settings.ACTION_WIFI_SETTINGS));
                }
            };
            sp.notification = context.getString(R.string.error_no_network);
            sp.actionText = context.getString(R.string.action_settings);
            sp.autoclose = 5000;
        } else if (ERROR_CODE_INVALID_CREDENTIALS.equals(errorCode)) {
            if (loginRelated) {
                sp.notification = context.getString(R.string.error_invalid_credentials);
            } else {
                sp.notification = context.getString(R.string.error_not_logged_in);
            }
            sp.autoclose = 3000;
        } else if (ERROR_CODE_WRONG_EMAIL.equals(errorCode)) {
            sp.notification = context.getString(R.string.error_wrong_email);
            sp.autoclose = 3000;
        } else if (ERROR_HASH_FUNCTION_ERROR.equals(errorCode)) {
            sp.notification = context.getString(R.string.error_not_logged_in);
            sp.autoclose = 3000;
        } else if (ERROR_STRIPE_CARD_DECLINED.equals(errorCode)) {
            sp.notification = context.getString(R.string.error_stripe_card_declined);
            sp.autoclose = 3000;
        } else if (ERROR_STRIPE_CARD_NUMBER_INCORRECT.equals(errorCode)) {
            sp.notification = context.getString(R.string.error_stripe_number_incorrect);
            sp.autoclose = 3000;
        } else if (ERROR_STRIPE_CARD_INVALID_MONTH.equals(errorCode)) {
            sp.notification = context.getString(R.string.error_stripe_invalid_month);
            sp.autoclose = 3000;
        } else if (ERROR_STRIPE_CARD_INVALID_YEAR.equals(errorCode)) {
            sp.notification = context.getString(R.string.error_stripe_invalid_year);
            sp.autoclose = 3000;
        } else if (ERROR_STRIPE_CARD_INVALID_CVC.equals(errorCode)) {
            sp.notification = context.getString(R.string.error_stripe_invalid_cvc);
            sp.autoclose = 3000;
        }
        Intent intent = new Intent(ACTION_SNACKBAR_NOTIFICATION);
        intent.putExtra(SnackbarPayload.class.getSimpleName(), sp);

        LocalBroadcastManager.getInstance(context).sendBroadcast(intent);
    }

    public void handle(String errorCode, boolean loginRelated, String error) {
        handle(context, errorCode, loginRelated, error);
    }

    public static class SnackbarPayload implements Serializable, SnackBar.OnActionClickListener {
        public String notification = null;
        public String actionText = null;
        public int autoclose = 0;

        public SnackbarPayload setNotification(String notification) {
            this.notification = notification;
            return this;
        }

        public SnackbarPayload setActionText(String actionText) {
            this.actionText = actionText;
            return this;
        }

        public SnackbarPayload setAutoclose(int autoclose) {
            this.autoclose = autoclose;
            return this;
        }

        @Override
        public void onActionClick(SnackBar snackBar, int i) {

        }
    }

}
