<link rel="stylesheet" type="text/css" media="all" href="../../CmpDocs.css" />

# Instructions for Rebound Competition

## Overview
In this competition, you create a "Gallilean Cannon" by arranging collisions between several balls of different masses in order to launch the rightmost ball as far as possible.

Here is a typical Rebound competition setup:

![Rebound Layout](./ReboundLayout.png)

You are given two or more balls with varying masses from which you may choose several, up to some maximum limit (2 balls in the diagram).  The ball choices appear in the upper part of the diagram, labelled by their masses.

The design challenge is to design the most powerful Gallilean cannon with the available materials.  You do this by placing the balls you choose in the 1 meter long *launch chute* to the left, where the 9 and 1 balls appear in the example, and assigning a *speed* to each ball, so that collisions between the balls impart the highest possible rightward speed to the rightmost ball.  The rightmost ball is then launched across the open area in the middle, bounces once off of the floor, and precisely hits the *target chute* on the right side.  You assign the distance between the two chutes (the width of the middle area) according to the speed your setup gives the rightmost ball, so that the ball hits the target chute.  You get a score if the ball accurately hits the target chute, and your score is based on how large a middle-area width you traversed to do so.

## The Details

### Ball size and placement
The balls have 8cm radius (16cm diameter).  You specify the x-coordinate of their center in meters from 0 (left) to 1 (right) within the launch chute, and there must be at least 1cm between each pair of balls and between the left/right balls and the left/right ends of the chute.  Thus the centers in practice may lie between 0.09m and .91m, and must be at least .17m apart from one another.

### Ball speed
You give each chosen ball an initial speed between -1 m/s to 1 m/s, with negative values indicating leftward speed and positive indicating rightward.  Thus any one ball has limited initial speed.  The trick is use ball collisions to get the right ball up to a speed many times as large as the initial speeds.

### Open area size
When launched, the right ball drops exactly 1m from the launch chute to the floor, and bounces elastically back up 1m.  The distance between the two chutes is set by *you*, and must be such as to cause the launched ball to precisely hit the target chute after one bounce (to have exactly height 1m as its center crosses the entrance to the target chute).  The longer this distance is, the higher your score, so maximizing the launch speed is essential.

### The gate
From the starting locations and speeds you supply, the balls bounce back and forth in the launch chute, with perfectly elastic collisions as they hit one another or the sides of the chute. 

The left side of the chute is always blocked, but the right side is a *gate*, marked in red.  You specify when to raise the gate, and this may be after the balls have bounced for some time.  If you raise it at 0 seconds, it's open from the start, but you may want to keep it closed for a time so that the right ball may bounce off the gate to build up more speed by repeated collisions with the ball to its left.  At the time you specify, the gate opens, and the next time the rightmost ball reaches the right end of the launch chute, it flies out into the central open area.  The gate closes automatically after the rightmost ball launches, so none of the other balls will escape the launch chute.

### Scoring
Your score is based on how far the rightmost ball flies before reaching the target chute.  The figure that gets 100% score is listed as part of the problem diagram.  Jumps less than this get proportionally lower scores.  You must launch at at least a speed needed to get a 1m distance or the solution is
invalid.

You get 5 free submissions in which to refine your answer.  You may make more submissions if you need to, but your score goes down by 10% for each submission past that limit.

## Some Basic Ideas to Work With
### Equations for Elastic Collision
You should get a full lecture or textbook presentation on the equations for elastic collisions and their derivation.  As a reminder, those equations are (with $u_1$ and $u_2$ the *precollision* speeds, and $v_1$ and $v_2$ as the *postcollision* speeds).  And the the index 1 ball is to the left, with the index 2 ball to the right.

$v_1 = \frac{m_1 - m_2}{m_1 + m_2}u_1 + \frac{2m_2}{m_1+m_2}u_2$

$v_2 = \frac{m_2 - m_1}{m_1 + m_2}u_2 + \frac{2m_1}{m_1+m_2}u_1$

This may be slightly different from the formulation you learned, but should
be identical modulo a few algebraic changes.

When doing hand or calculator-based computations with these equations, you may find it simpler to factor out the denominator (the sum of the two ball weights) until the end, in effect using these forms of the equations.

$v_1 = \frac{(m_1 - m_2)u_1 + 2m_2 u_2}{m_1 + m_2}$

$v_2 = \frac{(m_2 - m_1)u_2 + 2m_1 u_1}{m_1 + m_2}$

This form also better clarifies intuitive meaning of the equations, for instance that precollision speed $u_1$ contributes to postcollision speed 
$v_1$ propotionally to how much bigger $m_1$ is than $m_2$.  We'll look more
at this in the tutorial first example competition.

### Careful computation
As you get into the challenge, you'll find you need to do a lot of computations of ball collisions and travel times between collisions.  It's easy to make dumb mistakes.  Keep an orderly table of your work, and double check it.

And, if you are working in a team, it's very useful to have each member do the computations independently and compare results.  This lets you catch errors, and builds confidence when you come up with the same results.

### "Rolling off" the corners
If you are thoughtful about the physics of the competition, you might wonder if
the ball is truly in freefall the moment it leaves the lanuch chute, or if it
"rolls off" the lower corner of the chute a bit.  Recall you must launch the ball at a speed sufficient to get a 1m distance to the target chute.  The reason for this requirement is that at this speed or greater, the ball is in freefall throughout its trajectory; there's no need to worry about "roll off" or "roll on". 
