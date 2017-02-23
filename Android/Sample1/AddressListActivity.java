
public class AddressListActivity extends BaseTintLoadingActivity implements ActionMode.Callback
{

    public static final int ADDRESS_LOADER_ID = AddressListActivity.class.hashCode();
    public static final int COUNTRY_LOADER_ID = AddressListActivity.class.hashCode() + 1;
    public static final int DELETE_ADDRESS_LOADER_ID = AddressListActivity.class.hashCode() + 2;
    RecyclerView listView;
    List<Country> countryList = Collections.emptyList();
    SortedList<Address> filteredAddressList;
    SortedList<Address> fullAddressList;
    ActionMode actionMode;
    SparseBooleanArray selectedItems;
    RecyclerView.Adapter<AddressViewHolder> adapter;
    private int page;
    private boolean isLoading;
    private boolean hlai;

    @Override
    protected void onCreate(Bundle savedInstanceState)
    {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_address_list);

        listView = (RecyclerView) findViewById(android.R.id.list);
        FlexibleDividerDecoration.VisibilityProvider visibilityProvider = new FlexibleDividerDecoration.VisibilityProvider()
        {
            @Override
            public boolean shouldHideDivider(int i, RecyclerView recyclerView)
            {
                return false;
            }
        };
        listView.addItemDecoration(new MyDividerItemDecoration(this, visibilityProvider,
                                                               R.dimen.divider_margin_left_address));
        listView.setLayoutManager(new LinearLayoutManager(this));
        listView.setHasFixedSize(true);
        listView.getItemAnimator().setSupportsChangeAnimations(false);

        listView.setAdapter(adapter = new AddressAdapter());
        filteredAddressList = new SortedList<Address>(Address.class,
                                                      new SortedListCallbacks(adapter));
        fullAddressList = new SortedList<Address>(Address.class, new DummyAddressCallback());

        findViewById(R.id.btn_add_address).setOnClickListener(new View.OnClickListener()
        {
            @Override
            public void onClick(View v)
            {
                startActivityForResult(
                        new Intent(AddressListActivity.this, EditAddressActivity.class), 0);
            }
        });

        page = -1;
        Paginate.with(listView, new Paginate.Callbacks() {
            @Override
            public void onLoadMore() {
                page++;
                getSupportLoaderManager().initLoader(ADDRESS_LOADER_ID + page, null, new AddressLoaderCallbacks());
            }

            @Override
            public boolean isLoading() {
                return isLoading;
            }

            @Override
            public boolean hasLoadedAllItems() {
                return hlai;
            }
        })
                .setLoadingTriggerThreshold(2)
                .addLoadingListItem(true)
                .build();
        getSupportLoaderManager().initLoader(COUNTRY_LOADER_ID, null, new CountryLoaderCallbacks());
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data)
    {
        super.onActivityResult(requestCode, resultCode, data);
        if (resultCode == RESULT_OK)
        {
            getSupportLoaderManager().getLoader(ADDRESS_LOADER_ID).forceLoad();
        }
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu)
    {
        getMenuInflater().inflate(R.menu.menu_address_list, menu);

        SearchView search = (SearchView) menu.findItem(R.id.action_search);
        search.setOnQueryTextListener(new SearchView.OnQueryTextListener()
        {
            @Override
            public boolean onQueryTextSubmit(String query)
            {
                return true;
            }

            @Override
            public boolean onQueryTextChange(String newText)
            {
                for (int i = 0; i < fullAddressList.size(); i++)
                {
                    Address address = fullAddressList.get(i);
                    if (check(newText, address))
                    {
                        filteredAddressList.add(address);
                    }
                    else
                    {
                        filteredAddressList.remove(address);
                    }
                }
                return true;
            }

            protected boolean check(String searchText, Address address)
            {
                searchText = searchText.toLowerCase();
                if (address.name != null && address.name.toLowerCase().contains(searchText))
                {
                    return true;
                }
                if (address.surname != null && address.surname.toLowerCase().contains(searchText))
                {
                    return true;
                }
                if (address.addressLine1 != null && address.addressLine1.toLowerCase().contains(
                        searchText))
                {
                    return true;
                }
                if (address.addressLine2 != null && address.addressLine2.toLowerCase().contains(
                        searchText))
                {
                    return true;
                }
                if (address.city != null && address.city.toLowerCase().contains(searchText))
                {
                    return true;
                }
                                if(address.company != null && address.company.toLowerCase().contains(searchText)){
                                   return true;
                                }
                                if(address.postalCode != null && address.postalCode.toLowerCase().contains(searchText)){
                                   return true;
                                }
                return false;
            }
        });
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item)
    {
        int id = item.getItemId();

        switch (id)
        {
            case R.id.action_select:
                initSelection();
                return true;
            case R.id.action_delete_all:

                long[] toDelete = new long[fullAddressList.size()];
                for (int i = 0; i < fullAddressList.size(); i++)
                {
                    toDelete[i] = fullAddressList.get(i).id;
                }

                getSupportLoaderManager().restartLoader(
                        DELETE_ADDRESS_LOADER_ID + fullAddressList.hashCode(), null,
                        new DeleteAddressesLoaderCallbacks(toDelete));
                return true;
        }

        return super.onOptionsItemSelected(item);
    }

    void initSelection()
    {
        this.actionMode = startActionMode(this);
    }

    void updateTitle()
    {
        int selected = 0;
        for (int i = 0; i < selectedItems.size(); i++)
        {
            if (selectedItems.valueAt(i))
            {
                selected++;
            }
        }
        actionMode.setTitle(String.valueOf(selected));
    }

    void removeAddress(int position)
    {
        Address address = filteredAddressList.removeItemAt(position);
        fullAddressList.remove(address);
        adapter.notifyItemRemoved(position);
    }

    @Override
    public boolean onCreateActionMode(ActionMode mode, Menu menu)
    {
        menu.add(R.string.action_delete);
        return true;
    }

    @Override
    public boolean onPrepareActionMode(ActionMode mode, Menu menu)
    {
        selectedItems = new SparseBooleanArray();
        return true;
    }

    @Override
    public boolean onActionItemClicked(ActionMode mode, MenuItem item)
    {
        int number = 0;
        for (int i = 0; i < selectedItems.size(); i++)
        {
            if (selectedItems.valueAt(i))
            {
                number++;
            }
        }
        long[] toDelete = new long[number];
        int idx = 0;

        for (int i = 0; i < selectedItems.size(); i++)
        {
            if (selectedItems.valueAt(i))
            {
                toDelete[idx] = selectedItems.keyAt(i);
                idx++;
            }
        }
        getSupportLoaderManager().restartLoader(DELETE_ADDRESS_LOADER_ID + actionMode.hashCode(),
                                                null,
                                                new DeleteAddressesLoaderCallbacks(toDelete));

        mode.finish();
        return true;
    }

    @Override
    public void onDestroyActionMode(ActionMode mode)
    {
        actionMode = null;
        selectedItems = null;
        adapter.notifyDataSetChanged();
    }

    static class DummyAddressCallback extends SortedList.Callback<Address>
    {
        @Override
        public int compare(Address o1, Address o2)
        {
            return 0;
        }

        @Override
        public void onInserted(int position, int count)
        {
        }

        @Override
        public void onRemoved(int position, int count)
        {
        }

        @Override
        public void onMoved(int fromPosition, int toPosition)
        {
        }

        @Override
        public void onChanged(int position, int count)
        {
        }

        @Override
        public boolean areContentsTheSame(Address oldItem, Address newItem)
        {
            return oldItem.equals(newItem);
        }

        @Override
        public boolean areItemsTheSame(Address item1, Address item2)
        {
            return item1.id.equals(item2.id);
        }
    }


    class AddressLoaderCallbacks implements LoaderManager.LoaderCallbacks<List<Address>>
    {

        public AddressLoaderCallbacks(){
        }

        @Override
        public Loader<List<Address>> onCreateLoader(int id, Bundle args)
        {
            startProgress();
            isLoading = true;
            return new AddressLoader(AddressListActivity.this, page);
        }

        @Override
        public void onLoadFinished(Loader<List<Address>> loader, List<Address> data)
        {
            isLoading = false;
            if (data != null)
            {
                if (data.isEmpty()) {
                    hlai = true;
                }
                filteredAddressList.beginBatchedUpdates();
                for (int i = 0; i < data.size(); i++)
                {
                    filteredAddressList.add(data.get(i));
                    fullAddressList.add(data.get(i));
                }
                filteredAddressList.endBatchedUpdates();
                finishProgress();
            }
        }

        @Override
        public void onLoaderReset(Loader<List<Address>> loader)
        {
        }

    }

    class CountryLoaderCallbacks implements LoaderManager.LoaderCallbacks<List<Country>>
    {

        @Override
        public Loader<List<Country>> onCreateLoader(int id, Bundle args)
        {
            return new CountriesLoader(AddressListActivity.this);
        }

        @Override
        public void onLoadFinished(Loader<List<Country>> loader, List<Country> data)
        {
            if (data != null)
            {
                countryList = data;
                adapter.notifyItemRangeChanged(0, adapter.getItemCount());
            }
        }

        @Override
        public void onLoaderReset(Loader<List<Country>> loader)
        {
        }

    }

    class DeleteAddressLoaderCallbacks implements LoaderManager.LoaderCallbacks<long[]>
    {
        final AddressViewHolder holder;
        final long addressId;

        public DeleteAddressLoaderCallbacks(AddressViewHolder holder, long addressId)
        {
            this.holder = holder;
            this.addressId = addressId;
        }

        @Override
        public Loader<long[]> onCreateLoader(int id, Bundle args)
        {
            Context context = AddressListActivity.this;
            return new DeleteAddressLoader(context, new long[]{addressId});
        }

        @Override
        public void onLoadFinished(Loader<long[]> loader, long[] data)
        {
            if (data != null && data.length > 0)
            {
                removeAddress(holder.getAdapterPosition());
            }
            else
            {
                holder.delete.setEnabled(true);
            }
        }

        @Override
        public void onLoaderReset(Loader<long[]> loader) { }
    }

    class DeleteAddressesLoaderCallbacks implements LoaderManager.LoaderCallbacks<long[]>
    {
        final long[] addressId;

        public DeleteAddressesLoaderCallbacks(long[] addressId)
        {
            this.addressId = addressId;
        }

        @Override
        public Loader<long[]> onCreateLoader(int id, Bundle args)
        {
            Context context = AddressListActivity.this;
            return new DeleteAddressLoader(context, addressId);
        }

        @Override
        public void onLoadFinished(Loader<long[]> loader, long[] data)
        {
            if (data != null && data.length > 0)
            {
                for (long id : data)
                {
                    for (int j = 0; j < filteredAddressList.size(); j++)
                    {
                        if (filteredAddressList.get(j).id == id)
                        {
                            removeAddress(j);
                        }
                    }
                }
            }
        }

        @Override
        public void onLoaderReset(Loader<long[]> loader) { }
    }

    static class AddressViewHolder extends RecyclerView.ViewHolder
    {
        public View edit;
        public View delete;
        public TextView subtitle;
        public TextView title;
        public TextView initials;
        public View checkbox;
        public View checkboxIcon;
        public View listItem;

        public AddressViewHolder(View view)
        {
            super(view);
            title = (TextView) itemView.findViewById(R.id.tv_title);
            subtitle = (TextView) itemView.findViewById(R.id.subtitle);
            edit = itemView.findViewById(R.id.btn_edit);
            delete = itemView.findViewById(R.id.btn_delete);
            initials = (TextView) itemView.findViewById(R.id.tv_name_initials);
            checkbox = itemView.findViewById(R.id.checkbox);
            checkboxIcon = itemView.findViewById(R.id.checkbox_icon);
            listItem = itemView.findViewById(R.id.list_item);
        }

        public void animateFlip(final View viewFrom, final View viewTo, final View scale)
        {
            viewFrom.animate()
                    .rotationY(90f)
                    .setListener(new AnimatorListenerStub()
                    {
                        @Override
                        public void onAnimationEnd(Animator animation)
                        {
                            viewFrom.setVisibility(View.GONE);
                            viewTo.setVisibility(View.VISIBLE);
                            viewFrom.setRotationY(0f);
                            viewTo.setRotationY(-90f);
                            viewTo.animate()
                                    .rotationY(0f)
                                    .setListener(new RestoreStateAnimatorListener(viewTo))
                                    .start();
                            if (scale != null)
                            {
                                scale.setScaleX(0.5f);
                                scale.setScaleY(0.5f);
                                scale.animate()
                                        .scaleX(1f)
                                        .scaleY(1f)
                                        .setStartDelay(150)
                                        .setInterpolator(new OvershootInterpolator())
                                        .setListener(new RestoreStateAnimatorListener(scale))
                                        .start();
                            }
                        }
                    }).start();
        }
    }

    class SelectionToggleOnClickListener implements View.OnClickListener, View.OnLongClickListener
    {

        AddressViewHolder holder;
        boolean isChecked;

        public SelectionToggleOnClickListener(AddressViewHolder holder, boolean isChecked)
        {
            this.holder = holder;
            this.isChecked = isChecked;
        }

        @Override
        public void onClick(View v)
        {
            if (actionMode == null)
            {
                //                initSelection();
                return;
            }

            Address address = filteredAddressList.get(holder.getAdapterPosition());

            selectedItems.put(address.id.intValue(), isChecked);
            holder.itemView.setActivated(isChecked);
            updateTitle();
            if (isChecked)
            {
                holder.animateFlip(holder.initials, holder.checkbox, holder.checkboxIcon);
            }
            else
            {
                holder.animateFlip(holder.checkbox, holder.initials, null);
            }
        }

        @Override
        public boolean onLongClick(View v)
        {
            if (actionMode == null)
            {
                initSelection();
            }
            onClick(v);
            return true;
        }
    }

    class AddressAdapter extends RecyclerView.Adapter<AddressViewHolder>
    {
        {
            setHasStableIds(true);
        }

        @Override
        public long getItemId(int position)
        {
            return filteredAddressList.get(position).id;
        }

        @Override
        public AddressViewHolder onCreateViewHolder(ViewGroup parent, int viewType)
        {
            View view = getLayoutInflater().inflate(R.layout.li_address, parent, false);
            return new AddressViewHolder(view);
        }

        @Override
        public void onBindViewHolder(final AddressViewHolder holder, final int position)
        {
            final Address address = filteredAddressList.get(position);

            holder.title.setText(address.name + " " + address.surname);
            String countryName = getCountryById(address.id_country);
            String subtitle = address.city;
            if (!TextUtils.isEmpty(countryName))
            {
                subtitle = address.city + ", " + countryName;
            }
            holder.subtitle.setText(subtitle);
            holder.initials.setText(address.getInitials());

            holder.edit.setOnClickListener(new View.OnClickListener()
            {
                @Override
                public void onClick(View v)
                {
                    Intent intent = new Intent(AddressListActivity.this, EditAddressActivity.class);
                    intent.putExtra(EditAddressActivity.EXTRA_ADDRESS,
                                    filteredAddressList.get(holder.getAdapterPosition()));
                    startActivityForResult(intent, 0);
                }
            });
            holder.delete.setOnClickListener(new View.OnClickListener()
            {
                @Override
                public void onClick(View v)
                {
                    getSupportLoaderManager().restartLoader(
                            DELETE_ADDRESS_LOADER_ID + address.id.intValue(), null,
                            new DeleteAddressLoaderCallbacks(holder, address.id));
                    holder.delete.setEnabled(false);
                }
            });

            if (selectedItems != null && selectedItems.get(address.id.intValue()))
            {
                holder.itemView.setActivated(true);
                holder.initials.setVisibility(View.GONE);
                holder.checkbox.setVisibility(View.VISIBLE);
            }
            else
            {
                holder.itemView.setActivated(false);
                holder.initials.setVisibility(View.VISIBLE);
                holder.checkbox.setVisibility(View.GONE);
            }
            final SelectionToggleOnClickListener checkListener = new SelectionToggleOnClickListener(
                    holder, true);
            final SelectionToggleOnClickListener uncheckListener = new SelectionToggleOnClickListener(
                    holder, false);
            holder.initials.setOnClickListener(checkListener);
            //                holder.initials.setOnLongClickListener(checkListener);
            holder.checkbox.setOnClickListener(uncheckListener);
            //                holder.checkbox.setOnLongClickListener(uncheckListener);

            holder.itemView.setOnClickListener(new View.OnClickListener()
            {
                @Override
                public void onClick(View v)
                {
                    PBXApplication.getInstance()
                            .getPrefsManager()
                            .saveCurrentOrderId(PreferencesManager.NO_UPLOADED_ORDER)
                            .commit();
                    UploadActivity.startUploadActivity(AddressListActivity.this, address);
                }
            });
        }

        public String getCountryById(long countryId)
        {
            for (int i = 0; i < countryList.size(); i++)
            {
                Country country = countryList.get(i);
                if (country.id_country == countryId)
                {
                    return country.name;
                }
            }
            return null;
        }

        @Override
        public int getItemCount()
        {
            return filteredAddressList.size();
        }

    }

    static class SortedListCallbacks extends SortedList.Callback<Address>
    {

        RecyclerView.Adapter adapter;

        public SortedListCallbacks(RecyclerView.Adapter adapter)
        {
            this.adapter = adapter;
        }

        @Override
        public int compare(Address address, Address t21)
        {
            return 0;
        }

        @Override
        public void onInserted(int position, int count)
        {
            adapter.notifyItemRangeInserted(position, count);
        }

        @Override
        public void onRemoved(int position, int count)
        {
            adapter.notifyItemRangeRemoved(position, count);
        }

        @Override
        public void onMoved(int fromPosition, int toPosition)
        {
            adapter.notifyItemMoved(fromPosition, toPosition);
        }

        @Override
        public void onChanged(int position, int count)
        {
            adapter.notifyItemRangeChanged(position, count);
        }

        @Override
        public boolean areContentsTheSame(Address a1, Address a2)
        {
            return a1.equals(a2);
        }

        @Override
        public boolean areItemsTheSame(Address address1, Address address2)
        {
            return address1.id.equals(address2.id);
        }
    }


}
