import React from 'react';
import Wrap from './Todo';

// React.render(<App />, document.getElementById('root'));
var node = document.getElementById('root');
React.render(<Wrap more={['a', 2, 'c', 4]} str="thing" awesome={1} />, node);
