# Utils

Shortcut for utilities 
like for repetitive file uploading , mailing , tokens take and give .

# Database connection

"Database is always in another continent"
so , always use async-await while connecting database 
And also try-catch for catching error .


While mongoose connection , it provides a return value , so we can store it in a variable.

# Process.exit() in NodeJS
The process.exit() method instructs Node.js to terminate the process synchronously with an exit status of code. If code is omitted, exit uses either the 'success' code 0 or the value of process.exitCode if it has been set. Node.js will not terminate until all the 'exit' event listeners are called.

To exit with a 'failure' code:

import { exit } from 'node:process';

exit(1);
The shell that executed Node.js should see the exit code as 1.

Calling process.exit() will force the process to exit as quickly as possible even if there are still asynchronous operations pending that have not yet completed fully, including I/O operations to process.stdout and process.stderr .

# npm CORS packaage 
allows us for cross origin resource sharing

# npm cookie-parser package 
for cookies ... 
The cookie-parser npm package is used in Node.js (especially with Express.js) to parse cookies attached to the client request object.

By default, Express doesn't parse this header into a usable object. cookie-parser does that for you.
so,we have to install npm package of it ..

