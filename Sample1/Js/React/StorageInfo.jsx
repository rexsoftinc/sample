import JobController from '../../../controllers/JobController';

var StorageInfo = React.createClass({
    getInitialState: function() {
        return {
            storage: null,
            storage_calc:null
        }
    },

    componentWillMount: function() {
        var storage = null;
        for(var i=0; i<this.props.job_info.storages.length; i++) {
            if(this.props.job_info.job_info[0].storage_id == this.props.job_info.storages[i].id) {
                this.setState({
                    storage: this.props.job_info.storages[i]
                })
            }
        }
        this.setState({
            storage_calc: this.props.job_info.storage_calc
        })

    },

    componentWillReceiveProps: function(props) {
        for(var i=0; i<props.job_info.storages.length; i++) {
            if(props.job_info.job_info[0].storage_id == props.job_info.storages[i].id) {
                this.setState({
                    storage: props.job_info.storages[i]
                })
            }
        }
    },

    componentDidMount: function() {

        this.storages  = $(ReactDOM.findDOMNode(this.refs.storages));
        this.unit_sizes  = $(ReactDOM.findDOMNode(this.refs.unit_sizes));

        this.storages.select2({
            width: "100%",
            minimumResultsForSearch: -1
        });
        this.unit_sizes.select2({
            width: "100%",
            minimumResultsForSearch: -1
        });

        this.unit_sizes.on("change", (e) => {
            this.changeUnitSize( e );
        });

        this.storages.on("change", (e) => {
            this.changeStorage( e );
        });

        var _this = this
        $( ".datepicker-storage" ).datepicker({
            showOtherMonths: true,
            currentText: "(mm/dd/yyyy)",

            dateFormat: 'mm/dd/yy',
            onSelect: function ( val) {
                _this.changeStorageDates($(this).attr('name'),val);
            }
        });
    },

    changeStorage: function(e) {
        var event = Object.assign( {}, e );
        Simplex.SelectedJob.job_info[0].storage_id = event.target.value;
        JobController.saveJob();
    },

    saveChanges: function() {
        JobController.saveJob();
    },

    changeInfo: function(event) {
        Simplex.SelectedJob.storage_calc[event.target.name] = event.target.value;
        this.setState({
            storage_calc: Simplex.SelectedJob.storage_calc
        });
    },

    changeUnitSize: function(e) {
        var event = Object.assign( {}, e );
        Simplex.SelectedJob.storage_calc.unit_size_id = event.target.value;
        this.props.job_info.storage_unit_sizes.map((item)=>{
            if(item.id == event.target.value) {
                Simplex.SelectedJob.storage_calc.storage_fee = item.fee;
                Simplex.SelectedJob.storage_calc.late_fee = item.late_fee_percent
            }
        })
        JobController.saveJob();
    },

    changeStorageDates: function(name, val) {
        Simplex.SelectedJob.storage_calc[name] = val;
        this.setState({
            storage_calc: Simplex.SelectedJob.storage_calc
        });
    },

    componentDidUpdate: function() {
        this.storages  = $(ReactDOM.findDOMNode(this.refs.storages));
        this.unit_sizes  = $(ReactDOM.findDOMNode(this.refs.unit_sizes));

        this.storages.select2({
            width: "100%",
            minimumResultsForSearch: -1
        });
        this.unit_sizes.select2({
            width: "100%",
            minimumResultsForSearch: -1
        });
    },

    render: function() {
        var storages = this.props.job_info.storages.map((item)=>{
            let selected = '';
            if(item.id == this.props.job_info.job_info[0].storage_id) selected = "selected";
            return <option selected={selected} value={item.id}>{item.name}</option>
        });

        var unit_sizes = this.props.job_info.storage_unit_sizes.map((item)=>{
            let selected = '';
            if(item.id == this.props.job_info.storage_calc.unit_size_id) selected = "selected";
            return <option selected={selected} value={item.id}>{item.name}</option>
        })

        var storage_fee = 0;
        var last_pay = false;
        if(this.props.job_info.storage_calc.last_pay_date != '01/01/1970') {
          last_pay=true
        }
        console.log(this.props.job_info.storage_calc.last_pay_date)
        return (

            <div className="tab-pane active in fade" id="storageinfo">
                <div className="tabbable-wrap">
                    <table className="inventory-table table mod-noborder">
                        <tbody>
                            <tr>
                                <th colSpan="2">
                                    Contact info
                                </th>
                                <th colSpan="2">
                                    Fees info
                                </th>
                                <th colSpan="2">
                                    Dates info
                                </th>
                            </tr>
                            <tr>
                                <td>
                                    <span className="ico ico-distance" title="Job title"/>
                                </td>
                                <td>
                                    <input className="form-control" value={this.props.job_info.job_info[0].title} disabled type="text"/>
                                </td>
                                <td>
                                    Storage fee:
                                </td>
                                <td>
                                    <input className="form-control" name="storage_fee" value={this.props.job_info.storage_calc.storage_fee} type="text" onBlur={this.changeInfo}/>
                                </td>
                                <td>
                                    Length:
                                    <span className="mod-tableinput-descr">(months)</span>
                                </td>
                                <td>
                                    <input className="form-control js-numonly" name="length" value={this.props.job_info.storage_calc.length} type="text" onChange={this.changeInfo} />
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <span className="ico ico-storage" title="Storage"/>
                                </td>
                                <td>
                                    <select data-placeholder="Storage new" name="storage_id" ref="storages" className="mov-select mod-blue">
                                        <option selected value=""></option>
                                        {storages}
                                    </select>
                                </td>
                                <td>
                                    Last Pay Amount:
                                </td>
                                <td>
                                    <input className="form-control js-numonly" name="last_pay_amount" value={this.props.job_info.storage_calc.last_pay_amount} type="text" onChange={this.changeInfo}/>
                                </td>
                                <td>
                                    Last Pmt Date:
                                </td>
                                <td>
                                    <div className="input-row">
                                    {last_pay == true ?
                                      <input type="text" placeholder="Date"  name="last_pay_date"  value={this.props.job_info.storage_calc.last_pay_date} className="datepicker-storage form-control"/>
                                     : <input type="text" placeholder="Date"  name="last_pay_date" className="datepicker-storage form-control"/>
                                   }
                                        <span className="calendar"></span>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <span className="ico ico-addr-home" title="Storage address"/>
                                </td>
                                <td>
                                    <input className="form-control" value={this.state.storage.address} type="text"/>
                                </td>
                                <td>
                                    Prev. Balance:
                                </td>
                                <td>
                                    <input className="form-control js-numonly" name="prev_amount" value={this.props.job_info.storage_calc.prev_amount} type="text" onChange={this.changeInfo}/>
                                </td>
                                <td>
                                    Start Date:
                                </td>
                                <td>
                                    <div className="input-row">
                                        <input type="text" placeholder="Date" name="start_date" value={this.state.storage_calc.start_date} className="datepicker-storage form-control"/>
                                        <span className="calendar"></span>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <span className="ico ico-name" title="Manager name"/>
                                </td>
                                <td>
                                    <input className="form-control" value={this.state.storage.contact_name} type="text"/>
                                </td>
                                <td>
                                    Current Balance:
                                </td>
                                <td>
                                    <input className="form-control js-numonly" name="current_amount" value={this.props.job_info.storage_calc.current_amount} type="text" onChange={this.changeInfo}/>
                                </td>
                                <td>
                                    End Date:
                                </td>
                                <td>
                                    <div className="input-row">
                                        <input type="text" placeholder="Date" name="end_date" value={this.props.job_info.storage_calc.end_date} className="datepicker-storage form-control"/>
                                        <span className="calendar"></span>
                                    </div>
                                </td>
                            </tr>

                            <tr>
                                <td>
                                    <span className="ico ico-unread" title="Email"/>
                                </td>
                                <td>
                                    <input className="form-control " value={this.state.storage.email} type="email"/>
                                </td>
                                <td>
                                    Late Fee:
                                </td>
                                <td>
                                    <input className="form-control js-numonly" name="late_fee" value={this.props.job_info.storage_calc.late_fee} type="text" onChange={this.changeInfo}/>
                                </td>
                                <td>
                                    Due Date:
                                </td>
                                <td>
                                    <div className="input-row">
                                        <input type="text" placeholder="Date" name="due_date" value={this.props.job_info.storage_calc.due_date} className="datepicker-storage form-control"/>
                                        <span className="calendar"/>
                                    </div>
                                </td>
                            </tr>

                            <tr>
                                <td>
                                    <span className="ico ico-phone-home" title="Phone"/>
                                </td>
                                <td>
                                    <input className="form-control " value={this.state.storage.phone} type="text"/>
                                </td>
                                <td>
                                    Sales Tax:
                                </td>
                                <td>
                                    <input className="form-control js-numonly" name="sales_tax" value={this.props.job_info.storage_calc.sales_tax} type="text" onChange={this.changeInfo}/>
                                </td>
                                <td>
                                    Unit Size:
                                </td>
                                <td>
                                    <select data-placeholder="Select size" ref="unit_sizes" name="unit_size_id" className="mov-select mod-blue">
                                        <option selected value=""></option>
                                        {unit_sizes}
                                    </select>
                                </td>
                            </tr>

                            <tr>
                                <td>
                                    <span className="ico ico-rss" title="Cell phone"/>
                                </td>
                                <td>
                                    <input className="form-control " value={this.state.storage.cell_phone} type=""/>
                                </td>
                                <td>
                                    Discount:
                                </td>
                                <td>
                                    <input className="form-control js-numonly" name="discount" value={this.props.job_info.storage_calc.discount} type="text" onChange={this.changeInfo}/>
                                </td>
                                <td>
                                    Unit Code:
                                </td>
                                <td>
                                    <input className="form-control" name="unit_code" value={this.props.job_info.storage_calc.unit_code} type="text" onChange={this.changeInfo}/>
                                </td>
                            </tr>

                            <tr>
                                <td>
                                    <span className="ico ico-fax" title="Fax"/>
                                </td>
                                <td>
                                    <input className="form-control" value={this.state.storage.fax} type=""/>
                                </td>
                                <td>
                                    No of Items:
                                </td>

                                <td>
                                    <input className="form-control js-numonly" name="" value="0" type="text"/>
                                </td>

                                <td>
                                    Unit #:
                                </td>

                                <td>
                                    <input className="form-control " name="unit_number" value={this.props.job_info.storage_calc.unit_number} type="text" onChange={this.changeInfo}/>
                                </td>
                            </tr>

                            <tr>
                                <td>
                                    <span className="ico ico-addr-state" title="City"/>
                                </td>
                                <td>
                                    <input className="form-control " value={this.state.storage.city} type=""/>
                                </td>
                                <td></td>

                                <td></td>

                                <td></td>

                                <td></td>
                            </tr>

                            <tr>
                                <td>
                                    <span className="ico ico-loc-simple" title="State"/>
                                </td>
                                <td><input className="form-control" value={this.state.storage.state} type="text"/></td>
                                <td><input className="form-control js-numonly" maxlength="5" value={this.state.storage.zip} type=""/></td>
                                <td></td>
                                <td></td>
                            </tr>

                            <tr>
                                <td>
                                    <span className="ico ico-vagon"/>
                                </td>
                                <td colSpan="5">
                                  <div className="checkbox-row">
                                    <input id="1" type="checkbox" checked={this.state.storage.trailer_access == "1" ? 'checked' : ''} name=""/>
                                    <label htmlFor="1">Trailer access</label>
                                  </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <div className="tab-pane-bottom">
                        <button type="button" className="btn btn-default">Reset auto process</button>
                        <button type="button" className="btn btn-primary" onClick={this.saveChanges}>Save changes</button>
                    </div>

                </div>
                <div className="tabbable-wrap ">
                    <div className="tabbable page-tabs ">
                        <ul className="nav nav-tabs">
                            <li className="active">
                                <a href="#invoices" data-toggle="tab">
                                    INVOICES
                                    <span href="#" className="ico ico-recycle mod-pointer"></span>
                                    <span href="#" className="ico ico-mail-send mod-pointer"></span>
                                    <span href="#" className="ico ico-mail-resend mod-pointer"></span>
                                </a>
                            </li>

                            <li className="">
                                <a href="#paymentstab" data-toggle="tab">
                                    Payments
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div className="tab-content">
                        <div className="tab-pane active in fade" id="invoices">
                            <table className="inventory-table table mod-noborder">
                                <tbody>
                                    <tr>
                                        <th>
                                            <input type="checkbox" name=""/>
                                        </th>
                                        <th>
                                            Status
                                        </th>
                                        <th>
                                            Status Name
                                        </th>
                                        <th>
                                            Invoice Number
                                        </th>
                                        <th>
                                            Storage Type
                                        </th>
                                        <th>
                                            Invoice Type
                                        </th>
                                        <th>
                                            Generated Date
                                        </th>
                                        <th></th>
                                    </tr>
                                    <tr>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="tab-pane fade" id="paymentstab">
                            <table className="inventory-table table mod-noborder">
                                <tbody>
                                    <tr>
                                        <th>Ivoice #</th>
                                        <th>Paid deposit</th>
                                        <th>Payment Amt</th>
                                        <th>Tip</th>
                                        <th>Total payment</th>
                                        <th>Total balance</th>
                                        <th>Remaining</th>
                                        <th></th>
                                        <th></th>
                                    </tr>
                                    <tr>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
});

export default StorageInfo;
