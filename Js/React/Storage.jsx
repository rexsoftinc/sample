import {SimplexConnect, SimplexMapToProps} from 'react-simplex';
import StorageInfo from './StorageInfo';
import StorageInventory from './StorageInventory';
import StoragePayment from './StoragePayment';
import JobController from '../../../controllers/JobController'

var Storage = React.createClass({
    componentDidMount: function() {
        this.storage = $( ReactDOM.findDOMNode( this.refs.storage) );
        this.storage.select2({
            width: "100%",
            minimumResultsForSearch: -1
        });
        this.storage.on("change", (e) => {
            this.selectStorage( e );
        });
    },
    componentDidUpdate: function() {
        this.storage = $( ReactDOM.findDOMNode( this.refs.storage) );
        this.storage.select2({
            width: "100%",
            minimumResultsForSearch: -1
        });
    },
    selectStorage: function(e) {
        var event = Object.assign( {}, e );
        JobController.updateWithStorage(Simplex.SelectedJob, event.target.value)
    },
    render: function() {
        var storages = this.props.job_info.storages.map((item)=>{
            return <option value={item.id}>{item.name}</option>
        });
        return (
            <div className="container-fluid">
            {this.props.job_info.job_info[0].storage_id != "0" ?
                <div className="commonblock">
                    <div className="tabbable page-tabs">
                        <ul className="nav nav-tabs">
                            <li className="active">
                                <a href="#storageinfo" data-toggle="tab">
                                    Storage info
                                    <span href="#" className="ico ico-sign-stop mod-pointer"></span>
                                    <span href="#" className="ico ico-st-out mod-pointer"></span>
                                </a>
                            </li>
                            <li className="">
                                <a href="#invstored" data-toggle="tab">
                                    Inventory stored
                                </a>
                            </li>
                            <li className="">
                                <a href="#paymentinfo" data-toggle="tab">
                                    Payment info
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div className="tab-content">

                        <StorageInfo job_info={this.props.job_info}/>

                        <StorageInventory job_info={this.props.job_info}/>

                        <StoragePayment job_info={this.props.job_info}/>
                    </div>
                </div>
                : <div className="commonblock mod-common">
                    <div className="container-fluid input-wrap mod-smallerpaddings">
                        <div className="style">
                          <div className="input-row text-center">
                            <div className="col-xs-6 col-xs-offset-3">
                              <label>Select Storage</label>
                              <select data-placeholder="Category" ref="storage" name="storage" className="mov-select">
                              <option selected value=""></option>
                                  {storages}
                              </select>

                            </div>
                            <div className="input-row ">&nbsp;</div>
                          </div>
                        </div>
                    </div>
                  </div>
            }
        </div>
        )
    }
});

export default Storage;
