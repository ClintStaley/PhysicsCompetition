# Hints for Introductory Rebound Competition

## Overview
These hints walk you through a full analysis and solution of a small
Rebound design challenge, to give you a starting point for more complex
Rebound challenges.  The hints ask you to do some computational work and 
answer a few questions.  Talk with teammates and/or an instructor to figure
out the answers to these.

Throughout the example, we assume you have reviewed the elastic collision
equations in the main instructions.  We'll draw on those in the discussion, especially these forms:

$v_1 = \frac{(m_1 - m_2)u_1 + 2m_2 u_2}{m_1 + m_2}$

$v_2 = \frac{(m_2 - m_1)u_2 + 2m_1 u_1}{m_1 + m_2}$


## The Example Problem
Let's assume ball weights of 1kg, 3kg, and 8kg.  We'll set up a collision
between just two of these, say the 3kg and 1kg ball, with the 1kg ball to the
right, so it's the "launch ball".  We get to choose the velocities of the balls,
so let's start the 3kg ball moving right at 1 m/s (the max speed) with the 1kg
ball standing still.

**How fast will the 1kg move after the collision?**

Use the equations above to confirm that the 1kg ball will move at 1.5 m/s after
the collision.  Don't go on until you're sure this is correct.

**How fast is the 3kg ball moving after the collision?**

You should come up with an answer of .5 m/s.  Again, don't go on until you're
sure why this is so based on the equations.

**Total up the momenta**

A good reality check pre/post collision is to be sure the total momentum of the
system (mass x velocity of each ball, totalled) is the same, as collision
physics requires.  For instance, before the collision the total momentum is
3kg * 1m/s = 3mkg/s


## Some Design Questions


### Should the right ball be moving?


### Would a heavier left ball help?


### What about 3 balls?