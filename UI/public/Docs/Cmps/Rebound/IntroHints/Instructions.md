# Hints for Introductory Rebound Competition

## Overview
These hints walk you through a full analysis and solution of a small
Rebound design challenge, to give you a starting point for more complex
Rebound challenges.

9 5 1

5 to 1 direct compute
9 to 1 they do with answer supplied
Analyze equations -- does going in oppostie direction help?  

## Suggested Playing Strategy
### First Just try it out a bit
Since invalid solutions aren't penalized, start by just launching a ball or two, guessing several different speeds to hit a target or two.  Follow the diagram and see if you can calculate the impact times and locations you get from this.

## A Few Hints
### Equations for Elastic Collision
You should get a full lecture or text presentation on the equations for elastic
collisions and their derivation.  As a reminder, they are (with $u_1$ and
$u_2$ the *precollision* speeds, and $v_1$ and $v_2$ as the *postcollision*
speeds):

$v_1 = \frac{m_1 - m_2}{m_1 + m_2}u_1 + \frac{2m_2}{m_1+m_2}u_2$

$v_2 = \frac{m_2 - m_1}{m_1 + m_2}u_2 + \frac{2m_1}{m_1+m_2}u_1$

This may be slightly different from the formulation you learned, but should
be identical modulo a few algebraic changes.

When doing hand or calculator-based computations with these, you may find it
simpler to factor out the denominator (the sum of the two ball weights) until
the end, in effect using these forms of the equations.

$v_1 = \frac{(m_1 - m_2)u_1 + 2m_2 u_2}{m_1 + m_2}$

$v_2 = \frac{(m_2 - m_1)u_2 + 2m_1 u_1}{m_1 + m_2}$

This form also brings out more of the intuitive meaning of the equations, for instance that precollision speed $u_1$ contributes to postcollision speed 
$v_1$ propotionally to how much bigger $m_1$ is than $m_2$.  We'll look more
at this in the tutorial first example competition

### Careful computation
As you get into the challenge, you'll find you need to do a lot of computations of ball faljdjdjdklthing and rising times, speeds, etc.  It's easy to make dumb mistakes.  Keeping an orderly table of your work, and double checking it, will save you from extra submissions.

### "Rolling off" the corners
If you are thoughtful about the physics of the competition, you might wonder if
the ball is truly in freefall the moment it leaves the lanuch chute, or if it
"rolls off" the lower corner of the chute a bit.  At the speeds you'll be
required to lanuch to get at least a 1m distance to the target chute, this
will not happen.
