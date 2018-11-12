#Instructions for Bounce Competition

## Overview
In this competition, you'll launch balls to hit rectangular targets, while avoiding rectangular barriers.  You'll compete to hit all the targets, while avoiding the barriers, in as little time as possible.

## The Details
The diagram below shows a typical Bounce competition.  The playing area is a square 10m high and 10m wide, filled with rectangles, some green and some red  The green rectangles are **targets**, and the red ones are **barriers**.  You have to hit all the targets, while avoiding the barriers.

To do this, you launch balls from the upper left edge of the playing area, at any left-to-right horizontal speed you like.  Each ball you launch falls toward the bottom of the playing area at a gravitational acceleration of 9.8066 m/s^2.  Given the 10m height of the area, this means it'll hit the bottom in just over 1.4s.  Or, if you launch it fast enough, it'll hit the far right edge in less time than that.

But, if the ball hits any target or barrier, then it bounces off, perfectly elastically, and the target or barrier vanishes.  This means you can keep the ball going for quite a while by launching relatively slowly, and arranging for it to hit targets, bouncing back up off of each one.  The job, then, is to figure out a horizontal speed that makes the ball hit as many targets as possible before leaving the playing area, without hitting any barriers.

In some cases, you'll be able to hit all the targets with a single ball, but you're allowed as many balls as you need.  You specify a launch speed for each ball, and they get launched one after another, each one launched as soon as the prior one leaves the playing area.  For each ball you must also enter the location of its center, and the time, of the final target collision the ball makes before leaving the playing area.  (It's assumed you won't launch a ball without expecting to hit at least one target.)  This precludes solving the problem by iterative guessing; you have to do the math.

For each proposed solution you submit, you'll get a movie of the result.
If you hit all the targets without hitting any barriers, and if you get the right final impact time and location for each ball, then you have a **valid solution**.  Any valid solution gets a score based on how quickly all the targets were hit.  Valid solutions also get a table below the movie, showing exact data on each collision, so you can confirm your computations.

Any invalid solution is left unscored.  There's no penalty, and you can retry as much as you want.  Invalid solutions still get the movie, so you can see where you went wrong.  But they don't get a numerical table of collision data; you still have to fix the math yourself.

### Some numerical details
 * The diagram shows the corners of each target or barrier, in meters, measured from the bottom and left side of the playing area.  
  * The ball has a radius of .1 m, which you need to take into account when calculating impact times and locations.  
   * The simulated gravity is exactly 9.8066 m/s^2.  
   * Each ball launches after the prior one has *entirely* left the playing area, not just when the prior ball's centerpoint leaves the playing area.

## Suggested Playing Strategy

### First Just try it out a bit
Since invalid solutions aren't penalized, start by just launching a ball or two, retrying until you manage to hit a target or two.  Follow the diagram and see if you can calculate the impact times and locations you get from this.

### Use one ball per target
Once you've tried it out, calculate a solution that uses one ball per target if possible.  This is the easiest kind of solution to do.  Calculate the time the ball will take to fall to the level of the target, and calcualte the speed necessary for the ball to hit the target at that time.

### Now see if you can kill multiple targets per ball
Doing this requires calculating the timing of the ball as it rises and falls, computing the length of time for each rise and fall, and trying to get a horizontal speed that will hit all the desired targets at the right times.  Or, you can be more creative (some competitions require this) and bounce off the sides or even the bottom of targets)

### Speeding up the solution
The faster you hit all the targets, the better the score.  Thus, using fewer balls is generally a good idea, though a couple of fast balls may sometimes get the job done more quickly than one slow ball.  And for a given ball, using the fastest speed that will still hit all the targets is helpful.

## A Bit of Physics Help

### "Elastic" bounces
As you may know, "perfectly elastically" means the ball bounces away with the same velocity it hit, but with the velocity component in the direction of the target or barrier negated or reversed.  In the diagram below, the ball hits the rectangle with a downward velocity of 2 m/s and a horizontal velocity of 3 m/s.  After the collision, it has an *upward* velocity of 2 m/s, and the horizontal velocity is unchanged.  It's important to think of the ball's velocity in two components -- vertical and horizontal.

