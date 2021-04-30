var ghpages = require('gh-pages');

ghpages.publish(
    '/public', // path to public directory
    {
        branch: 'gh-pages',
        repo: 'https://github.com/pezzabros/pnrr-voronoi.git', // Update to point to your repository  
        user: {
            name: 'Daniele Pezzatini', // update to use your name
            email: 'd.pezzatini@gmail.com' // Update to use your email
        }
    },
    () => {
        console.log('Deploy Complete!')
    }
)