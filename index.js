'use strict';

const Fs = require( 'fs' );
const Express = require( 'express' );
const app = Express();
const server = require( 'http' ).createServer( app );
const Router = Express.Router();
const chartLib = Fs.readFileSync( './node_modules/chart.js/dist/Chart.bundle.min.js', 'utf8' );
const file = __dirname + '/data.dat';
let data, fileData, result, runnings = 0;
const report = {
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

/* create file */
const fileStream = Fs.createWriteStream( file, { flags: 'a', encoding: 'utf8' });
process.on( 'SIGINT', () => {
   fileStream.end(); // close stream
   process.exit( 0 );
});

/* test route */
Router.get( '/test', ( req, res ) => {

   /*** start: Add your leak code here ***/

   // TODO: leakage code

   /*** end: Add your leak code here ***/

   writeMemoryUsage(); // save memory usage in file
   return res.send();
}, ( err, req, res, next ) => next( err ));

/* after test you can see report on url "/memory-usage" */
Router.get( '/memory-usage', ( req, res, next ) => {
   try {
      fileData = Fs.readFileSync( file, 'utf8' );
      fileData = fileData.split( '\n' );
   } catch( error ) {
      if( error.code === 'ENOENT' ) {
         result = 'Memory usage file not found, try collect memory usage data before!';
         console.log( result );
      }
      else {
         throw error;
      }
   }

   /* get report data */
   fileData.map( data => {
      if( ! data ) {
         return;
      }
      data = data.split( '|' ).map( v => + v ); // to number
      report.rss.current.push( data[ 0 ] );
      report.rss.min = data[ 0 ] < report.rss.min && data[ 0 ] || report.rss.min; // get min
      report.rss.max = data[ 0 ] > report.rss.max && data[ 0 ] || report.rss.max; // get max
      report.heapTotal.current.push( data[ 1 ] );
      report.heapTotal.min = data[ 1 ] < report.heapTotal.min && data[ 1 ] || report.heapTotal.min;
      report.heapTotal.max = data[ 1 ] > report.heapTotal.max && data[ 1 ] || report.heapTotal.max;
      report.heapUsed.current.push( data[ 2 ] );
      report.heapUsed.min = data[ 2 ] < report.heapUsed.min && data[ 2 ] || report.heapUsed.min;
      report.heapUsed.max = data[ 2 ] > report.heapUsed.max && data[ 2 ] || report.heapUsed.max;
      report.external.current.push( data[ 3 ] );
      report.external.min = data[ 3 ] < report.external.min && data[ 3 ] || report.external.min;
      report.external.max = data[ 3 ] > report.external.max && data[ 3 ] || report.external.max;
      runnings ++;
   });

   /* if data available */
   if( runnings ) {

      /* prepare data */
      data = {
         x: {
            runnings: Array.from({ length: runnings }, ( v, k ) => k + 1 ).toString(),
         },
         y: {
            rss: {
               min: toMb( report.rss.min ),
               max: toMb( report.rss.max ),
               current: report.rss.current.map( v => toMb( v )).toString(),
               average: report.rss.current.map(( _, i, arr ) => average( arr.slice( 0, i + 1 ))).map( v => toMb( v )).toString() // get average for each next record in array
            },
            heapTotal: {
               min: toMb( report.heapTotal.min ),
               max: toMb( report.heapTotal.max ),
               current: report.heapTotal.current.map( v => toMb( v )).toString(),
            },
            heapUsed: {
               min: toMb( report.heapUsed.min ),
               max: toMb( report.heapUsed.max ),
               current: report.heapUsed.current.map( v => toMb( v )).toString(),
            },
            external: {
               min: toMb( report.external.min ),
               max: toMb( report.external.max ),
               current: report.external.current.map( v => toMb( v )).toString(),
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
}, ( err, req, res, next ) => next( err ));


/* initialize */
app.use( '/', Router );
server.listen( 3000 );
console.log( 'Process ID:', process.pid );

function writeMemoryUsage() {
   const memoryUsage = process.memoryUsage(); // in bytes
   fileStream.write( `${ memoryUsage.rss }|${ memoryUsage.heapTotal }|${ memoryUsage.heapUsed }|${ memoryUsage.external }\n` );
}

function average( ...arr ) {
   const nums = [].concat( ...arr );
   return nums.reduce(( acc, val ) => acc + val, 0 ) / nums.length;
}

function toMb( bytes ) {
   return Math.round( + bytes / 1024 / 1024 * 1000 ) / 1000;
}
