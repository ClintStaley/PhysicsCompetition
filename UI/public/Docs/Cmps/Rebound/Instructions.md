# Instructions for Rebound Competition

## Overview
In this competition, you'll arrange collisions between several balls of different masses in order to launch the rightmost ball as far as possible.

Here is a typical Rebound competition setup:

![Rebound Layout](./ReboundLayout.png)

You are given two or more balls with varying masses.  The ball choices appear in the upper part of the diagram,  labelled by their masses.

Your task is to place one or more of these in the 1 meter long *launch chute* to the left, where the 9 and 1 balls appear in the example, and to assign a *speed* to each ball, so that collisions between the balls impart the highest possible rightward velocity to the rightmost ball.  The rightmost ball is then launched across the open area in the middle, bounces once off of the floor, and precisely hits the *target chute* on the right side.  You assign the distance between the two chutes (the width of the middle area) to match the velocity your setup gives the rightmost ball so that the target chute gets hit.  You get a score if the ball accurately hits the target chute, and your score is based on how large a middle-area width you traversed to do so.

## The Details

### Ball size and initial placement
The balls have 8cm radius (16cm diameter).  You specify the x-coordinate of their center in meters from 0 to 1 within the launch chute, and there must be at least 1cm between each pair of balls and between the left/right balls and the left/right ends of the chute.  Thus the centers in practice may lie between 0.09m and .91m, and must be at least .17m apart from one another.

### Ball initial speed
You give each chosen ball an initial speed between -1 m/s to 1 m/s, with negative values indicating leftward speed and positive indicating rightward.  Thus any one ball has limited initial speed.  The trick is to use ball collisions to get the right ball up to a speed many times as large as the initial speeds.

### Open area size
When launched, the right ball drops exactly 1m from the launch chute to the floor, and bounces elastically back up 1m.  The distance between the two chutes is set by *you*, and must be such as to cause the launched ball to precisely hit the target chute after one bounce (to have exactly height 1m as its center crosses the entrance to the target chute).  The longer this distance is, the higher your score, so getting a maximum launch speed is essential.

### The gate
From the starting locations and speeds you supply, the balls bounce back and forth in the launch chute, with perfectly elastic collisions as they hit one another, or the sides of the chute. 

The left side of the chute is always blocked, but the right side is a *gate*, marked in red, that you may raise after the balls have bounced for some time.  If you raise it at 0 seconds, it's open from the start, but you may want to keep it closed for a time so that the right ball may bounce off the right side of the launch chute to build up more speed by repeated collisions with the ball to its left.  At the time you specify, the gate opens, and the next time the rightmost ball reaches the right end of the launch chute, it is free to fly out into the central open area.  The gate closes automatically after the rightmost ball launches, so none of the other balls will escape the launch chute.

### Scoring
Your job is to arrange the initial ball choices, locations and speeds, and the gate opening time and inter-chute distance, to make the rightmost ball fly as far as possible.  The figure that gets 100% score is listed as part of the problem diagram.  Jumps less than this get proportionally lower scores.  You must 
launch at at least a speed needed to get a 1m distance or the solution is
invalid.

#### Five free submissions
And, you are only allowed 5 free submissions in which to refine your answer.  You may make more submissions if you need to, but your score goes down by 10% for each submission past the limit.

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
