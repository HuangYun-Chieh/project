import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import HomePage from './components/HomePage';
import FoodRecordsPage from './components/FoodRecordsPage';
import HealthIndicatorsPage from './components/HealthIndicatorsPage';

function App() {
  return (
    <Router>
      <div className="App">
        <Switch>
          <Route path="/" exact component={HomePage} />
          <Route path="/food-records" component={FoodRecordsPage} />
          <Route path="/health-indicators" component={HealthIndicatorsPage} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;
