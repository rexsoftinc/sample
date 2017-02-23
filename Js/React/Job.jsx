import JobInfo from './JobInfo';
import JobMovingInfo from './JobMovingInfo';
import JobEstimated from '../jobEstimated/JobEstimated';
import JobNotes from '../jobNotes/JobNotes';
import JobCustomerNotes from '../jobNotes/JobCustomerNotes';
import JobExstraStops from '../jobNotes/JobExstraStops';
import RatePayment from '../ratePayment/RatePayment';
import Storage from '../storage/Storage';
import ExpRes from '../expres/ExpRes';
import Inventory from '../inventory/Inventory';
import PartnerInfo from '../partner/PartnerInfo';
import EmailDetail from '../../emails/EmailDetail.jsx';

import { SimplexConnect } from 'react-simplex';

var Job = React.createClass({

    render: function() {
        if(!this.props.SelectedJob ) return null;
        if( this.props.SelectedJob.hidden ) return null;

        var components = [];

        switch (this.props.components) {
            case 'general':
            if(this.props.SelectedJob.job_info[0].type == "3") {
                components.push(
                    <Storage job_info={this.props.SelectedJob}/>
                );
            } else {
                components.push(
                    <div>
                        <JobMovingInfo      job_info={this.props.SelectedJob} />
                        <JobCustomerNotes   job_info={this.props.SelectedJob} />
                        <JobNotes           job_info={this.props.SelectedJob} />
                        <JobExstraStops     job_info={this.props.SelectedJob} />
                    </div>
                );
            }
                break;
            case 'rate':
                components.push(
                    <RatePayment job_info={this.props.SelectedJob}/>
                );
                break;
            case 'storage':
                components.push(
                    <Storage job_info={this.props.SelectedJob}/>
                );
                break;
            case 'exp':
                components.push(
                    <ExpRes job_info={this.props.SelectedJob}/>
                );
                break;
            case 'partner':
                components.push(
                    <PartnerInfo job_info={this.props.SelectedJob}/>
                );
                break;
            case 'inventory':
                components.push(
                    <Inventory job_info={this.props.SelectedJob}/>
                );
                break;
            case 'jobs-email':
                components.push(
                    <EmailDetail job_info={this.props.SelectedJob} detailEmailObj={this.props.detailEmailObj}/>
                );
                break;
        }

        return (
            <div>
                <div className="commonblock mod-common" style={{'padding-top': 0}}>
                    <JobInfo  job_info={this.props.SelectedJob} />
                    {this.props.components == 'storage' ? <div></div> : <JobEstimated   job_info={this.props.SelectedJob} />}
                </div>
                {components}
            </div>
        );
    }
});

Job = SimplexConnect( Job, ['SelectedJob'] );

export default Job;
