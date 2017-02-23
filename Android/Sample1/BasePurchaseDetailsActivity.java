
public abstract class BasePurchaseDetailsActivity<T> extends BaseActivity implements LoaderManager.LoaderCallbacks<T> {
    public static final int COUNTRY_LOADER_ID = BasePurchaseDetailsActivity.class.hashCode();
    protected View footer;
    protected View header;
    protected View shipping;
    SimpleDateFormat df;
    View empty;
    RecyclerView list;
    View progress;
    protected HeaderFooterAdapter<ProjectViewHolder> adapter;
    protected List<Country> countries = Collections.emptyList();
    protected View checkoutBtn;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_order_details);

        df = new SimpleDateFormat(getString(R.string.order_li_date_format));

        empty = findViewById(android.R.id.empty);
        list = (RecyclerView) findViewById(android.R.id.list);
        progress = findViewById(android.R.id.progress);

        list.setLayoutManager(new LinearLayoutManager(this));
        FlexibleDividerDecoration.VisibilityProvider visibilityProvider = new FlexibleDividerDecoration.VisibilityProvider() {
            @Override
            public boolean shouldHideDivider(int i, RecyclerView recyclerView) {
                return false;
            }
        };
        list.addItemDecoration(new MyDividerItemDecoration(this, visibilityProvider, R.dimen.divider_margin_left_order));

        list.setAdapter(adapter = createAdapter());

        footer = LayoutInflater.from(this).inflate(getFooterLayoutId(), list, false);
        header = LayoutInflater.from(this).inflate(getHeaderLayoutId(), list, false);
        shipping = LayoutInflater.from(this).inflate(R.layout.i_shipping_footer, list, false);
        adapter.addHeader(prepareHeader());
        adapter.addFooter(prepareShipping());
        adapter.addFooter(prepareFooter());

        checkoutBtn = findViewById(R.id.btn_checkout);
        checkoutBtn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                OrderPaymentActivity.startPaymentActivity(BasePurchaseDetailsActivity.this, getOrderId());
            }
        });

        showProgress();
        getSupportLoaderManager().initLoader(getLoaderId(), null, this);
        getSupportLoaderManager().initLoader(COUNTRY_LOADER_ID, null, new CountriesLoaderCallbacks());
    }

    protected Long getOrderId() {
        return null;
    }

    protected abstract void countriesUpdated();

    protected abstract int getHeaderLayoutId();

    protected abstract int getFooterLayoutId();

    protected abstract HeaderFooterAdapter<ProjectViewHolder> createAdapter();

    protected abstract int getLoaderId();


    protected View prepareShipping() {
        TextView shippingSum = (TextView) shipping.findViewById(R.id.shipping_sum);
        shippingSum.setText(PBXApplication.getFormattedCurrency(getShippingCost()));
        return shipping;
    }

    protected abstract float getShippingCost();

    protected abstract void prepareData(T data);

    protected abstract View prepareFooter();

    protected abstract View prepareHeader();

    protected View bindAddress(View view, long id, String purchaseDate, Address address) {
        TextView title = (TextView) view.findViewById(R.id.tv_title);
        TextView date = (TextView) view.findViewById(R.id.date);
        TextView name = (TextView) view.findViewById(R.id.name);
        TextView addressTextView = (TextView) view.findViewById(R.id.address);

        title.setText(getString(R.string.order_li_title, id));
        date.setText(purchaseDate);
        if (address != null) {
            name.setText(address.name + " " + address.surname);
            StringBuilder sb = new StringBuilder();
            sb.append(address.addressLine1);
            if (!TextUtils.isEmpty(address.addressLine2)) {
                sb.append(" ");
                sb.append(address.addressLine2);
            }
            sb.append(", ");
            sb.append(address.postalCode);
            sb.append(" ");
            sb.append(address.city);
            String country = findCountry(address.id_country);
            if (country != null) {
                sb.append(", ");
                sb.append(country);
            }
            addressTextView.setText(sb.toString());
        }

        return view;
    }

    protected String findCountry(long countryId) {
        for (Country country : countries) {
            if(country.id_country == countryId){
                return country.name;
            }
        }
        return null;
    }

    protected void showList() {
        list.setVisibility(View.VISIBLE);
        progress.setVisibility(View.GONE);
        empty.setVisibility(View.GONE);

    }

    protected void showProgress() {
        list.setVisibility(View.GONE);
        progress.setVisibility(View.VISIBLE);
        empty.setVisibility(View.GONE);
    }

    protected void showEmpty() {
        list.setVisibility(View.GONE);
        progress.setVisibility(View.GONE);
        empty.setVisibility(View.VISIBLE);
    }

    @Override
    public abstract Loader<T> onCreateLoader(int id, Bundle args);


    @Override
    public void onLoadFinished(Loader<T> loader, T data) {
        if (data != null) {
            prepareData(data);

            prepareHeader();
            prepareShipping();
            prepareFooter();
            showList();
        } else {
            showEmpty();
        }
    }

    @Override
    public void onLoaderReset(Loader<T> loader) {
    }

    class CountriesLoaderCallbacks implements LoaderManager.LoaderCallbacks<List<Country>> {
        @Override
        public Loader<List<Country>> onCreateLoader(int id, Bundle args) {
            return new CountriesLoader(BasePurchaseDetailsActivity.this);
        }

        @Override
        public void onLoadFinished(Loader<List<Country>> loader, List<Country> data) {
            countries = data;
            countriesUpdated();
        }

        @Override
        public void onLoaderReset(Loader<List<Country>> loader) { }
    }
}
