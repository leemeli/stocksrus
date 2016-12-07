import React from 'react';
import {Button} from 'react-bootstrap';
import PortfolioTable from './PortfolioTable';
import PortfolioTableRow from './PortfolioTableRow';
import firebase from 'firebase';
import { hashHistory } from 'react-router';
import Nav from './Nav';

export default class Portfolio extends React.Component {
    constructor(props) {
        super(props);
        this.componentWillMount = this.componentWillMount.bind(this);
        this.state = {
            stocks: [], 
            stocksTables:[],
            finishedLoading: false,
            noStocks: false,
            allStockObjects: [],
            allStockCodes: [],
            tableItems: []
        };
    }

    updateState(stateChange) {
        this.setState(stateChange);
    }

    handleChange(event) {
        var field = event.target.name;
        var value = event.target.value;

        var changes = {}; //object to hold changes
        changes[field] = value; //change this field
        this.setState(changes); //update state
    }

    // If user is not authenticated, show login page
    componentWillMount() {
        var that = this;
        firebase.auth().onAuthStateChanged(
            user => {
                if (user) {
                    if (user.email !== null) {
                        console.log("You're logged in as", user.email);


                        // Reevaluate user's net worth when the user is here:
                        var netWorth = 0;

                        var fullName = '';
                        var userNameRef = firebase.database().ref('users/' + user.uid + '/fullName');
                        userNameRef.once('value')
                            .then(function (snapshot) {
                                fullName = snapshot.val();
                                that.setState({
                                    name: fullName
                                });
                            }
                            ).then(function () {
                                var userCashRef = firebase.database().ref('users/' + user.uid + '/cash');
                                userCashRef.once('value')
                                    .then(function (snapshot) {

                                        // Cash assets
                                        var cashVal = snapshot.val();
                                        netWorth += cashVal;

                                        that.setState(
                                            {
                                                cash: (cashVal).toFixed(2),
                                            }
                                        );

                                        var netWorthRef = firebase.database().ref('users/' + user.uid + '/netWorth');

                                        // Stock assets (index 4 of the first array returned == losing price on the most recent day)
                                        var userStocksRef = firebase.database().ref('users/' + user.uid + '/stocks');
                                        userStocksRef.once('value')
                                            .then(function (snapshot2) {
                                                var itemArray = [];
                                                snapshot2.forEach(function (stock) {
                                                    var company = stock.key;
                                                    var quantity = stock.val();
                                                    var stockPrice = 0;

                                                    console.log('Company: ' + company, 'Quantity: ' + quantity);

                                                    if (quantity > 0) {

                                                        fetch('https://www.quandl.com/api/v3/datasets/WIKI/' + company + '.json?api_key=_-huFRLBpt58XiqjyQyU')
                                                            .then(
                                                            function (response) {
                                                                console.log('Response from ' + company);
                                                                if (response.status !== 200) {
                                                                    console.log('Looks like there was a problem. Status Code: ' +
                                                                        response.status);
                                                                    return;
                                                                }

                                                                // Examine the text in the response  
                                                                response.json().then(function (data) {
                                                                    stockPrice = data.dataset.data.slice(0, 1)[0][4];
                                                                    console.log(data.dataset.data.slice(0, 1)); // Today's stock array
                                                                    console.log(data.dataset.data.slice(1, 2)); // Yesterday's stock array
                                                                    var totalValue = quantity * stockPrice;
                                                                    netWorth += totalValue;
                                                                    console.log('New net worth: ' + netWorth);
                                                                    var netWorthPromise = netWorthRef.set(netWorth);
                                                                    var companyName = data.dataset.name;
                                                                    itemArray.push(<PortfolioTableRow key={companyName} quantity={quantity} name={companyName} stock={data.dataset.data} stockCode={company}/>);
                                                                    that.setState({tableItems: itemArray});
                                                                    return Promise.all([netWorthPromise]);
                                                                });
                                                            })
                                                            .catch(function (err) {
                                                                console.log('Fetch Error :-S', err);
                                                            });
                                                    }
                                                });
                                            });
                                    });
                            });
                    }
                } else {
                    console.log('Not logged in, redirecting to login page');
                    hashHistory.push('/login');
                }
            }
        );
    }


    render() {
        var myItems = this.state.tableItems;
        console.log(myItems);
        if (myItems.length < 1) {
            return(
            <div>
            <Nav updateParent={this.updateState} cash={this.state.cash} name={this.state.name} />
            <div className="container" id="personal-timeline"><p>Loading...</p>
            </div>
            </div>
            )
        }

        return (
            <div>
            <Nav updateParent={this.updateState} cash={this.state.cash} name={this.state.name} />
            <div className="container" id="personal-timeline">
            <h1 className="title">My Portfolio</h1>
            <table className="table table-bordered table-hover" aria-live="polite">
                <tbody>
                <tr id="firstRow">
                    <th>Company</th>
                    <th>Symbol</th>
                    <th>QTY</th>
                    <th>Purchase Price</th> 
                    <th>Current Price</th>
                    <th>Net Change</th>
                    <th>Total Net Change</th>
                    <th>% Change</th>
                </tr>
                    {/* Populate table with stock information from API here*/}
                    
                    {myItems}

                </tbody>
             </table>
             </div>
            </div>
        );
    }
}