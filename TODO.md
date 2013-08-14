* Implement data-airy (volatile) and config caching
* rescan the whole document (initAllLazy - bad name): there's an error
* On changed event on text field? How to handle?
* Note: data-cfg is optional and defined/has specific meanings per component/core action

* Sample components (each in a box):

+ Clock: data-lazy="false"
  - Init clock
  - Timer to set time
  - Pause/Stop/Reset

+ Increase
  - Reset
  - Up
  - Down

+ Login
  - custom binding to text fields
  - click Login
  - error message

+ TODO list
  - Add
  - Check/Uncheck
  - Remove