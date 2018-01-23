'use strict';

const test = require( 'ava' );
const Request = require( 'axios' ); // any http client
const test_url = `http://localhost:3000/test`;

test.before(() => Request({ url: test_url }));
test.after.always(() => Request({ url: test_url }));

test.cb( 'test', t => t.end());
