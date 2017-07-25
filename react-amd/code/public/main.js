// main.js
requirejs.config({
    // module name mapped to CDN url
    paths: {
        // Require.js appends `.js` extension for you
        'react': 'https://cdnjs.cloudflare.com/ajax/libs/react/15.4.2/react',
        'react-dom': 'https://cdnjs.cloudflare.com/ajax/libs/react/15.4.2/react-dom'
    }
});

// load the modules defined above
requirejs(['react', 'react-dom'], function(React, ReactDOM) {
    // now you can render your React elements
    ReactDOM.render(
        React.createElement('p', {}, 'Hello, AMD!'),
        document.getElementById('docroot')
    );
});