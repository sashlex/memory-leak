'use strict';

const Fs = require( 'fs' );
const Express = require( 'express' );
const app = Express();
const server = require( 'http' ).createServer( app );
const Router = Express.Router();
const chartLib = Fs.readFileSync( './node_modules/chart.js/dist/Chart.bundle.min.js', 'utf8' );
const file = __dirname + '/data.json';
let log = false,  data, report, result;

/* test route */
Router.get( '/test', ( req, res ) => {
   writeMemoryUsage(); // save memory usage in file
   return res.send();
}, ( err, req, res, next ) => next( err ));

/* report on url /memory-usage */
Router.get( '/memory-usage', ( req, res ) => {
   try {
      report = JSON.parse( Fs.readFileSync( file, 'utf8' ));
   } catch( error ) {
      if( error.code === 'ENOENT' ) {
         result = 'Memory usage file not found, try collect memory usage data before!';
         console.log( result );
      }
      else {
         throw error;
      }
   }

   /* if data available */
   if( report ) {

      /* prepare data */
      data = {
         x: {
            runnings: Array.from({ length: + report.runnings }, ( v, k ) => k + 1 ).toString()
         },
         y: {
            rss: {
               min: toMb( + report.rss.min ),
               max: toMb( + report.rss.max ),
               current: report.rss.current.map( v => toMb( + v )).toString(),
               average: report.rss.current.map(( _, i, arr ) => average( arr.slice( 0, i + 1 ))).map( v => toMb( + v )).toString() // get average for each next record in array
            },
            heapTotal: {
               min: toMb( + report.heapTotal.min ),
               max: toMb( + report.heapTotal.max ),
               current: report.heapTotal.current.map( v => toMb( + v )).toString(),
            },
            heapUsed: {
               min: toMb( + report.heapUsed.min ),
               max: toMb( + report.heapUsed.max ),
               current: report.heapUsed.current.map( v => toMb( + v )).toString(),
            },
            external: {
               min: toMb( + report.external.min ),
               max: toMb( + report.external.max ),
               current: report.external.current.map( v => toMb( + v )).toString(),
            }
         }
      };

      /* get page */
      result = `<!doctype html><html><head></head><body><script>${ chartLib }</script><canvas id = 'chart'></canvas>
<script>
   var ctx = document.getElementById( 'chart' ).getContext( '2d' );
   var config = {
      responsive: true,
      type: 'line',
      data: {
         labels: [ ${ data.x.runnings } ],
         datasets: [{
            label: 'RSS: min: ${ data.y.rss.min } max: ${ data.y.rss.max }',
            steppedLine: true,
            data: [ ${ data.y.rss.current } ],
            borderColor: 'red',
            backgroundColor: 'red',
            fill: false,
            borderWidth: 1,
            pointRadius: 0,
         },{
            label: 'RSS AVERAGE',
            steppedLine: true,
            data: [ ${ data.y.rss.average } ],
            borderColor: 'brown',
            backgroundColor: 'brown',
            fill: false,
            borderWidth: 1,
            pointRadius: 0,
         },{
            label: 'HEAP TOTAL: min: ${ data.y.heapTotal.min } max: ${ data.y.heapTotal.max }',
            steppedLine: true,
            data: [ ${ data.y.heapTotal.current } ],
            borderColor: 'green',
            backgroundColor: 'green',
            fill: false,
            borderWidth: 1,
            pointRadius: 0,
         },{
            label: 'HEAP USED: min: ${ data.y.heapUsed.min } max: ${ data.y.heapUsed.max }',
            steppedLine: true,
            data: [ ${ data.y.heapUsed.current } ],
            borderColor: 'blue',
            backgroundColor: 'blue',
            fill: false,
            borderWidth: 1,
            pointRadius: 0,
         },{
            label: 'EXTERNAL: min: ${ data.y.external.min } max: ${ data.y.external.max }',
            steppedLine: true,
            data: [ ${ data.y.external.current } ],
            borderColor: 'orange',
            backgroundColor: 'orange',
            fill: false,
            borderWidth: 1,
            pointRadius: 0,
         }]
      },
      options: {
         legend: {
            labels: {
               boxWidth: 20,
               }
         },
         responsive: true,
         title: {
            display: true,
            text: 'Memory usage in Mb',
         },
         scales: {
            xAxes: [{
               scaleLabel: {
                  display: true,
                  labelString: 'Runnings',
                  fontStyle: 'bold'
               },
            }],
            yAxes: [{
               scaleLabel: {
                  display: true,
                  labelString: 'Memory',
                  fontStyle: 'bold'
               },
               ticks: {
                  stepSize: 10
               }
            }]
         }
      }
   };
   new Chart( ctx, config );
</script>
</body></html>`;
   }
   return res.send( result );
});


/* initialize */
app.use( '/', Router );
server.listen( 3000 );
console.log( process.pid );

function writeMemoryUsage() {
   const memoryUsage = process.memoryUsage();
   let report, message;

   /* get previous data */
   try {
      report = JSON.parse( Fs.readFileSync( file, 'utf8' ));
   } catch( error ) {
      if( error.code === 'ENOENT' ) {

         /* initialize if not */
         report = {
            runnings: 0,
            rss: {
               min: 999999999,
               max: -999999999,
               current: []
            },
            heapTotal: {
               min: 999999999,
               max: -999999999,
               current: []
            },
            heapUsed: {
               min: 999999999,
               max: -999999999,
               current: []
            },
            external: {
               min: 999999999,
               max: -999999999,
               current: []
            }
         };
      }
      else {
         throw error;
      }
   }

   /* prepare message */
   message = `Memory usage in Mb:\nrunnings: ${ ++ report.runnings }\n`;

   for( let key in memoryUsage ) {
      report[ key ].current.push( memoryUsage[ key ]); // remember value
      report[ key ].min = ( report[ key ].min > memoryUsage[ key ]) ? memoryUsage[ key ] : report[ key ].min; // get min
      report[ key ].max = ( report[ key ].max < memoryUsage[ key ]) ? memoryUsage[ key ] : report[ key ].max; // get max

      /* prepare report for console, values in megabytes */
      message += `${ key } | current: ${ toMb( + memoryUsage[ key ] ) } | min: ${ toMb( + report[ key ].min ) } | max: ${ toMb( + report[ key ].max ) } | average: ${ toMb( + average( report[ key ].current )) }\n`;
   }

   /* save new data */
   Fs.writeFileSync( file, JSON.stringify( report ), { encoding: 'utf8' });

   /* show report */
   log && console.log( message );
}

function average( arr ) {
   return arr.reduce(( acc, val ) => acc + val, 0 ) / arr.length;
}

function toMb( bytes ) {
   return Math.round( + bytes / 1024 / 1024 * 1000 ) / 1000;
}
