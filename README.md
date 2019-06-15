CUCC
====

a web tool for calculating units and logging meals.

features
--------

+ tracks calouries
+ calculates required corrections
+ allows x:y ratios
+ saves to local storage
+ allows for importing and exporting of histories

mathematics
----------

### ratio calculation
```
F(x, y) = y / x
```
### correction ratio calculation
F(x, y) = x / y

### correction calculation
```
F(n, s) = (n - 7) * s
```
### unit calculation
```
F(c, r) = c / r
```

issues
------
in my experience, firefox mobile cannot save data to local storage.
i would recommend using chrome or a chromium derivative for mobile use.

to do
-----

+ switch local storage to indexeddb
+ change storage type to be store meals per day
+ change importing and exporting to use files

misc
----

this utility was created by george beers for hannah.
anyone may use it, however i cannot guarantee full functionality for all users.
created under the MIT license.
