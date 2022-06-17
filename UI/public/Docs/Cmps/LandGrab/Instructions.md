<link rel="stylesheet" type="text/css" media="all" href="../../CmpDocs.css" />

# Instructions for Land Grab Competition

## Overview
In this competition, you'll choose several circles that do not overlap with one another nor with the barriers in the diagram.  The goal is to maximize the area of the chosen circles. 

## The Details
The playing area is a 100x100 square, in the first quadrant, with origin at the lower left.  Within the area are a number of blue rectangular *barriers*, with corner dimensions given. 

You compete by choosing several circles via the submit dialog, giving the center point and radius of each circle.  Each circle must avoid overlapping any of the barriers, and any of the prior circles, and must fit entirely within the 100x100 region.  If so, it is *valid*, and its area is added to your total.  Your score is based on the total area of all the valid circles.  

### The Response Diagram
When you make a submission, all your circles show in gray on the diagram while the submission is being graded, and then show in green or red, depending on whether each circle is valid or not.  At the bottom of the display is the total area of valid circles.

## Some Hints on Design
Obviously, it's best to place circles in the largest open areas, and make each as big as possible.  One simple, though non-optimal, way to do this is to make a best guess as to the center point, and then compute the distance from your centerpoint to each obstacle corner you might hit, to the centers of all other circles, and to the edges of the playing area.  This information will help you pick the largest radius you can set without overlap.  It may also give you an idea of how you might slightly adjust your center to increase the possible radius.

## Check Each Other's Numbers
And, if you are working in a team, it's very useful to have each member do the computations independently and compare results.  This lets you catch errors, and builds confidence when you come up with the same results.