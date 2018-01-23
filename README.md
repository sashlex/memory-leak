#### Empty express project memory leak test:
*( memory slow growing )*

- **Run project:**
  - *For check with http://localhost:300/memory-usage:* node --stack_trace_limit=0 --max_old_space_size=10 --optimize_for_size --always_compact index.js
  - *For chrome dev tools:* node --inspect --stack_trace_limit=0 --max_old_space_size=5 --optimize_for_size --always_compact index.js

- **Optional run:** htop -p 1234
- **Start tests:**
  - Set number of runs in run-test.sh, $COUNT parameter;
  - chmod +x ./run-test.sh
  - ./run-test.sh
  - Ctrl + c - stop test;

- **After tests (to avoid increase memory usage), check memory usage on:** http://localhost:300/memory-usage