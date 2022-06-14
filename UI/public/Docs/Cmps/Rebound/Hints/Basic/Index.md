<link rel="stylesheet" type="text/css" media="all" 
 href="../../../../CmpDocs.css" />

# Basic Hints for Rebound Competition

## Overview
These hints walk you through a full analysis and solution of a small
Rebound design, to give you a starting point for more complex
Rebound challenges.  The hints ask you to do some computational work and 
answer a few questions.  Talk with teammates and/or an instructor to figure
out the answers to these questions.

We'll assume you have reviewed the elastic collision
equations in the main instructions.  We'll use those in the following discussion, in these forms:

$v_1 = \frac{(m_1 - m_2)u_1 + 2m_2 u_2}{m_1 + m_2}$

$v_2 = \frac{(m_2 - m_1)u_2 + 2m_1 u_1}{m_1 + m_2}$


## The Example Problem
Let's assume ball weights of 1kg, 3kg, and 8kg, and start with a collision
between just two of these, say the 3kg and 1kg ball, with the 1kg ball to the
right, so it's the "launch ball".  

We get to choose the velocities of the balls,
so let's start the 3kg ball moving right at 1 m/s (the max speed) with the 1kg
ball standing still until the 3kg ball hits it.

**How fast will the 1kg ball move after the collision?**

Use the equations above to confirm that the 1kg ball will move at 1.5 m/s after
the collision.  Don't go on until you're sure this is correct.

**How fast is the 3kg ball moving after the collision?**

You should come up with an answer of .5 m/s.  Again, don't go on until you're
sure of this, based on the equation for $v_1$.

**Check the momenta**

It's a good reality check to calculate the total momentum of the
system before and after collision.  Collision
physics requires that the total momentum be unchanged.  For instance, before the example collision the total momentum is in the 3kg ball and is 3kg * 1m/s = 3mkg/s.  After collision the total momentum is 3kg * .5 m/s + 1kg * 1.5 m/s, which still totals 3mgk/s.  

## Some Design Questions
Now that we've reviewed the math of one collision, let's look at some design
considerations.

**Would a heavier left ball make the 1kg ball go faster?**

Let's examine the equation for $v_2$ to see what impact $m_1$ has on the outcome.  As $m_1$ increases, both the
numerator and denominator increase, but as $m_1$ becomes very large, what value
does $v_2$ approach?  (Assume $u_2$ remains 0)

You should reach the conclusion that $m_2$ becomes relatively unimportant, and
$v_2$ approaches:

$v_2 = \frac{2m_1 u_1}{m_1} = 2 u_1$ 

So the larger $m_1$ gets relative to $m_2$, the closer $u_2$ gets to $2 u_1$

Replace the 3kg ball with the 8kg ball.  What $u_2$ value do you get now?  You
should end up with a value just over 1.75, improving on the 1.5 value from before.

**Should the 1kg ball be moving initially?**

So far, we've left the 1kg ball at rest before the collision.  Would we get
a better result by giving it an initial velocity, and in which
direction if so?

It might seem sensible to start the 1kg ball moving to the right, so
it has a starting velocity that is augmented by the collision.  But look closely
at the equation for $v_2$.  Does increasing $u_2$ increase $v_2$, assuming $m_1 > m_2$?

Since $(m_2 - m_1)$ is *negative*, a positive $u_2$ actually *reduces* $v_2$.  In effect, the left ball can't impart as much momentum to the 1kg ball if it's
"catching up" to it.  Indeed, if both velocities start at 1 m/s there will be no
collision at all since the left ball will never catch up.

This suggests that a negative (leftward) $u_2$ would be better, and this is so.  Calculate the $v_2$ value if $u_1 = 1$ and $u_2 = -1$.  You should come up with a value even better than 1.75, and in fact over 2.5 m/s.

**What about a multistage collision?**

What if we set up a three-way collision, with the 8kg, 3kg and 1kg balls lined up left to right?  Can the 8kg ball kick the 3kg ball to 
a speed fast enough to get an even better final speed from the 1kg ball?  

Yes, it can.  You should be able to get the 3kg ball to nearly 2 m/s, and the 1kg ball to a velocity well above 2.5 m/s.  The particulars are left as an exercise.