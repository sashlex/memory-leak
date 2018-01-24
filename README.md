#### Boilerplate for memory leak test, for express.js project development:
- **Add any node library for testing in code:**
  - Edit file "index.js", add your test code in "/test" route, for stress test;

- **Install "ab" utility, for ubuntu:**
  - sudo apt-get install apache2-utils

- **Run project:**
  - node index.js

- **Optional run process monitor:** htop -p &lt;Process ID&gt;
- **Start test:**
  - ab -n 10000 -c 100 http://localhost:3000/test

- **After test (to avoid increase memory usage), check memory usage on page:** http://localhost:3000/memory-usage

- **Remove data file for next testing:** ./data.dat
