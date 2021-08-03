#Instructions for Rebound Competition

Notes:

1. 6 random balls; choose 3
2. 1 m long chute
3. All balls have initial speed and position up to 1 m/s
4. Gate opens at user-specified time <= 10s
5. 10m x 10m area
6. Must predict launch speed or final location?
7. Score based on speed
8. 

## Overview
In this competition, you'll organize several balls of different masses in order to shoot one of the balls as far as possible.

## The Details
Here is a typical Rebound competition setup:


And here is the same setup in schematic form, with coordinates for the obstacle and target corners.

![Bounce Diagram](./BounceDiagram.png)

You are given 6 balls of different masses in kg.  All are 10cm in diameter. 
you may place 2-4 of them (the max number is given in the problem) in the *launch area*

### Scoring details

And, finally, you are only allowed 5 free submissions in which to refine your answer.  You may make more submissions if you need to, but your score goes down by 10% for each submission past the limit.

### Some numerical details
 * The diagram shows the corners of each target or barrier, in meters, measured from the bottom and left side of the playing area.  
  * The ball has a radius of .1 m, which you need to take into account when calculating impact times and locations.  
   * The simulated gravity is exactly 9.81 m/s^2.  
   * Each ball launches after the prior one has *entirely* left the playing area, not just when the prior ball's centerpoint leaves the playing area.
   * The diagram movie leaves a faded ball outline at each collision even though the ball moves on.  If the collision was with the **corner**, this faded outline is a square instead of a circle.

## Suggested Playing Strategy

### First Just try it out a bit
Since invalid solutions aren't penalized, start by just launching a ball or two, guessing several different speeds to hit a target or two.  Follow the diagram and see if you can calculate the impact times and locations you get from this.

### Use one ball per target
Once you've tried it out, calculate a solution that uses one ball per target.  This is the easiest kind of solution to do.  Calculate the time the ball will take to fall to the level of the target, and calculate the speed necessary for the ball to hit the target at that time.

### Now see if you can kill multiple targets per ball
Doing this requires calculating the timing of the ball as it rises and falls, computing the length of time for each rise and fall, and trying to get a horizontal speed that will hit all the desired targets at the right times.  Or, you can be more creative (some competitions require this) and bounce off the sides or even the bottom of targets)

### Speeding up the solution
The faster you hit all the targets, the better the score.  Thus, using fewer balls is generally a good idea, though a couple of fast balls may sometimes get the job done more quickly than one slow ball.  And for a given ball, using the fastest speed that will still hit all the targets is helpful.

## A Few Hints

### "Elastic" bounces
As you may know, "perfectly elastically" means the ball bounces away with the same velocity it hit, but with the velocity component in the direction of the target or barrier negated or reversed.  In the diagram below, the ball hits the rectangle with a downward velocity of 2 m/s and a horizontal velocity of 3 m/s.  After the collision, it has an *upward* velocity of 2 m/s, and the horizontal velocity is unchanged.  It's important to think of the ball's velocity in two components -- vertical and horizontal.



### Careful computation
As you get into the challenge, you'll find you need to do a lot of computations of ball falling and rising times, speeds, etc.  It's easy to make dumb mistakes.  Keeping an orderly table of your work, and double checking it, will save you from extra submissions.
