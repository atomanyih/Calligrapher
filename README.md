_Note from far future 2021: this was done as part of a 2013 summer internship implementing a method described in the paper "A Kai Style Calligraphic Beautification Method for Handwriting Chinese Character", Weiping Xia; Lianwen Jin. Apart from a small modification for github pages, this is repo is in the same state it was left in_

Calligrapher
============

A Javascript application to procedurally beautify Chinese calligraphy.

### Calligraphic Beautification

The system takes as user input handwritten Chinese characters, uses a least squared fit
to split each stroke into segments, then applies visual styles based on the orientation
and length of the segments and their neighbors.
