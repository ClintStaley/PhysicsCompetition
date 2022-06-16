<link rel="stylesheet" type="text/css" media="all" 
 href="../../../../CmpDocs.css" />
 
 # Gold Hints for Rebound Competition

## Overview
These hints cover more advanced design ideas for the Rebound competition.

As in other Rebound hints, we'll use these equations:

$v_1 = \frac{(m_1 - m_2)u_1 + 2m_2 u_2}{m_1 + m_2}$

$v_2 = \frac{(m_2 - m_1)u_2 + 2m_1 u_1}{m_1 + m_2}$

And we'll assume ball weights of 1kg, 3kg, and 8kg.

## Rebounds off the same ball
The major new design idea to close the gate for a while in order to let the 
launch ball bounce off the gate, and get hit again by the ball to its left.  
Let's use a configuration with an 8kg ball at 1m/s and a 1kg ball at -1m/s.

**How fast will each ball be moving after the first collision?**

Do this computation to arrive at a velocity of over 2.5 for the 1kg ball and 
over .5 for the 8kg ball.

Now, keep the gate closed, and let the 1kg *bounce off the gate*.  Its 
velocity will be exactly reversed (negated), causing a second collision with 
the 8kg ball.  

**How fast will the 1kg ball move after the second collision?**

Use the equations above to confirm that the 1kg ball will move at nearly 3 m/s 
after the second collision.

**How fast is the 8kg ball moving after the second collision?**

You should come up with an answer of between -0.1 and -0.2 (i.e. moving to the
left).  The 8kg ball has transferred all of its rightward momentum, and a little
more than that, to the 1kg ball.

Does this mean it's always worth a second bounce if the 8kg ball is still 
moving to the right?  Not necessarily.  To arrange a second bounce, the 1kg ball
must bounce off the gate.

**What happens to the total momentum of the balls when the 1kg bounces off the
gate?**

With some thought, you should see that the total rightward momentum of the balls
reduces with that collision.  How much depends on the speed with which the
1kg ball hits the gate.  (Technically the momentum is still preserved, but it's
transferred to the gate and the entire rig.)  A second bounce isn't always worth
that loss; you have to do the math.  

### Check the momenta

Calculating the total momenta after the second collision is still a good reality 
check, if you reduce the total by the momentum lost to the gate.

**Compute the total momenta for the 8kg and 1kg ball after the first collision.**

Your answer should total 7 mkg/s.

**Compute the total momenta for the two balls after the second collision.**

This answer requires computing the momentum lost to the gate, which you should
compute at a little more than 5 mkg/s, leaving just under 2 mkg/s as the total.
This should match the momentum calculated from the two balls' speeds and masses.