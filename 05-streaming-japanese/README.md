The purpose of this was to discover why utf-8 characters were getting garbled. The solution is to make sure the response that sends back the stream has "charset=utf-8" in the content-type header.
