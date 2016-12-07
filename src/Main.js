import React from 'react';
import Nav from './Nav';
import PoliticalBar from './PoliticalBar';
import Timeline from './Timeline';
// import StockTable from './StockTable';
// import SignUpApp from './SignUpApp';
// import SignInApp from './SignInApp';
// import About from './About';
// import Footer from './Footer';
import firebase from 'firebase';
import { hashHistory } from 'react-router';

export default class MainPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            netWorth: false,
            cash: '',
            name: '',
            currentStock: 'MSFT'
        };
        // var user = firebase.auth().currentUser;
        // this.state = {
        //     currentUser: user
        // };
        this.updateState = this.updateState.bind(this);
        this.handleStockChange = this.handleStockChange.bind(this);
    }

    updateState(stateChange) {
        this.setState(stateChange);
    }

    handleStockChange(event) {
        var field = event.target.name;
        var value = event.target.value;
        this.setState({currentStock: value});
        this.forceUpdate();
        console.log(this.state.currentStock);
        
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

                                                                    var totalValue = quantity * stockPrice;
                                                                    netWorth += totalValue;
                                                                    console.log('New net worth: ' + netWorth);
                                                                    var netWorthPromise = netWorthRef.set(netWorth);
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
        console.log(this.state.currentStock);
        var timeline = <Timeline stock={this.state.currentStock} />;
        
        console.log(timeline);
        
        return (
            <div>
                <Nav updateParent={this.updateState} cash={this.state.cash} name={this.state.name} />
                <main role="main" id="loggedInMain">
                    <PoliticalBar onChangeFunc={this.handleStockChange} />
                    {timeline}
                </main>
            </div>
        );
    }
}