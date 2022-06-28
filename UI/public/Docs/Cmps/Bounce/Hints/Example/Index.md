<link rel="stylesheet" type="text/css" media="all" 
 href="../../../../CmpDocs.css" />

# Hints for Bounce Example Competition

## Overview
These hints will give you direct answers for the example Bounce competition, along with
some reasoning on how those answers were derived. (See 
[Bounce Instructions](../../Instructions.html) for full details on the rules.)

## The Competition

![Problem Diagram](ProblemDiagram.png)

The example competition has three red targets, and one black barrier.  Let's
start by shooting just one ball from the upper left corner, at a speed that will
cause it to just hit the top target on the left of the barrier.  Maybe 1.5 
meter/sec will do the trick...

We click Make First Attempt and enter the speed for one ball.  The competition
instructions also require that we enter the time and location of the final ball
collision, but we'll ignore that for now.

![First Try](FirstTry.png)

Click the OK, and wait a brief moment while the system evaluates our design...

We get "Invalid solution" because we left the time and location of the collision
as all zeros, but we can still see what our design did.  Click the Play button...

![First Try](FirstTryResults.png)

OK.  That didn't work.  We could always guess until we get the answer, but let's
try some physics instead:

1. The center of the ball will fall 4.9 meters, because it starts at 10m, and
the top of the target is at (x,y) location (2.0, 5.0) (note the label on its upper
left corner).  That might seem like a 5m fall, but the ball's radius is .1m
and so the center will only fall to y = 5.1m -- a drop of 4.9m

2. With gravity of 9.81 m/s, the standard gravitational acceleration equation
shows the ball will fall for .999 seconds.  (Check this on your own, possibly
with help from an instructor.)

3. So, a speed of say 2.1 m/s will make the ball travel to the right 
$.999 * 2.1 = 2.099$ meters as it falls.  

We do another attempt, entering 2.1 m/s, and the collision time of .999 and 
location of x = 2.099 and y = 4.9 (the ball's center location, remember).