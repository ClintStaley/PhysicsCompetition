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

**Does this mean it's always worth a second bounce if the 8kg ball is still 
moving to the right?**

Not

### Check the momenta

Checking the total momenta after the second collision is a good reality check, 
but something important happens to the total momentum after a collision with 
the gate.

**If the 1kg ball is moving at, say, 2 m/s, and bounces off the gate elastically, 
what happens to the total moment

