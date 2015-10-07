
import React from 'react';

class Other extends React.Component {
  render() {
    return <div>Other</div>;
  }
}

class Awesome extends React.Component {
  render() {
    return <div>
      <strong>Hello!</strong>
      <Other/>
    </div>;
  }
}

React.render(<Awesome/>, document.getElementById('content'));
