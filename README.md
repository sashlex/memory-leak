#### Empty express project memory leak test:

- **Run project:**
  - *For check with http://localhost:300/memory-usage:* node --stack_trace_limit=0 --max_old_space_size=5 --optimize_for_size --always_compact index.js
  - *For chrome dev tools:* node --inspect --stack_trace_limit=0 --max_old_space_size=5 --optimize_for_size --always_compact index.js

- **Optional run:** htop -p 1234
- **Start tests:**
  - chmod +x ./run-test.sh
  - ./run-test.sh

- **Check memory usage on:** http://localhost:300/memory-usage