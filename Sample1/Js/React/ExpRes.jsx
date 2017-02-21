import ExpResAgent from './ExpResAgent';
import ExpResDriver from './ExpResDriver';
import ExpResMover from './ExpResMover';
import ExpResTruck from './ExpResTruck';
import ExpResTotal from './ExpResTotal';
import ExpResExpense from './ExpResExpense';

var ExpRes = React.createClass({

    getInitialState: function () {
        return {
            total_summ: [],
            salary: 0,
            expenses: 0
        }
    },

    set: function(data) {
      this.state.total_summ.push(data);
    },

    totalSalary: function(data) {
        this.setState({
            salary: parseFloat(data).toFixed(2)
        })
    },

    totalExpenses: function(data) {
        this.setState({
            expenses: parseFloat(data).toFixed(2)
        })
    },

    render: function () {
        return (
            <div className="commonblock mod-common container-fluid">

                <div className="col-xs-6">
                  <div className="style">
                    <div className="form-title col-xs-6">
                        Resource
                    </div>

                    <div className="form-title col-xs-6">
                        Salary
                    </div>

                    <ExpResAgent job_info={this.props.job_info} set={this.set}/>

                    <ExpResDriver job_info={this.props.job_info} set={this.set}/>

                    <ExpResMover job_info={this.props.job_info}/>

                    <ExpResTruck job_info={this.props.job_info} set={this.set}/>

                    <ExpResTotal job_info={this.props.job_info} totalSalary={this.totalSalary} total={this.state.total_summ}/>
                  </div>
                </div>

                <ExpResExpense job_info={this.props.job_info} totalExpenses={this.totalExpenses} />

                <div className="col-xs-3">
                  <div className="style">
                    <div className="form-title col-xs-6">
                        Totals
                    </div>
                    <table className="table mod-equalhalf" >
                        <tbody>
                        <tr>
                            <td>
                                Job Total
                            </td>
                            <td>
                                <input value={this.props.job_info.calc_info[0].final_total} readonly className="form-control"/>
                            </td>
                        </tr>

                        <tr>
                            <td>
                                Salary
                            </td>
                            <td>
                                <input value={this.state.salary} readonly className="form-control"/>
                            </td>
                        </tr>

                        <tr>
                            <td>
                                Expenses
                            </td>
                            <td>
                                <input value={this.state.expenses} readonly className="form-control"/>
                            </td>
                        </tr>

                        <tr>
                            <td>
                                Profit
                            </td>
                            <td>
                                <input value={(parseFloat(this.props.job_info.calc_info[0].final_total) - parseFloat(this.state.salary) - parseFloat(this.state.expenses)).toFixed(2)} readonly className="form-control"/>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                  </div>
                </div>
            </div>
        )
    }
});

export default ExpRes;
