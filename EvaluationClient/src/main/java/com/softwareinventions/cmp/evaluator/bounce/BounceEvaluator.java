package com.softwareinventions.cmp.evaluator.bounce;

import java.util.Arrays;
import java.util.LinkedList;

import org.apache.commons.math3.analysis.UnivariateFunction;
import org.apache.commons.math3.analysis.polynomials.PolynomialFunction;
import org.apache.commons.math3.analysis.solvers.LaguerreSolver;
import org.apache.commons.math3.complex.Complex;
import org.codehaus.jackson.map.ObjectMapper;

import com.softwareinventions.cmp.dto.Submit;
import com.softwareinventions.cmp.evaluator.Evaluator;
import com.softwareinventions.cmp.evaluator.Evl;
import com.softwareinventions.cmp.evaluator.EvlPut;
import com.softwareinventions.cmp.util.GenUtil;

public class BounceEvaluator extends Evaluator {
	// Constants
	public static final double STARTING_HEIGHT = 100.0;
	public static final double GRAVITY = -9.80665;
	public static final double RADIUS = 1;
	public static final double ZERO = 0.00000001;

	// Represent one Collision, including its type, its time, the location of
	// circle center as of the collision, and the index of the struck obstacle.
	private static class Collision {
		public enum HitType {CORNER, HORIZONTAL, VERTICAL};

		public HitType hType;
		
		public double time;
		public double xHit;
		public double yHit;

		public int obstacleIdx = -1;

		public Collision(double time, HitType hType, double xHit, double yHit) {
			this.time = time;
			this.hType = hType;
			this.xHit = xHit;
			this.yHit = yHit;
		}
	}

	// Represent one rectangular obstacle.
	private static class Obstacle {
		public double loX;
		public double hiX;
		public double hiY;
		public double loY;
		public int obstacleId;
	}

	// Competition parameters
	private static class Parameters {
		public double targetTime;    // 100% credit for this total time in s.
		public Obstacle[] obstacles; // Obstacles to hit
	}

	public static class LaunchSpec {
		public double speed;
	}

	/*
	 * BounceEvent describes a bounce off of a platform, the starting point of the
	 * ball, or the ball going out of bounds. in the case of a bounce, the 
	 * velocityX and velocityY of the ball are the velocities after the bounce,
	 * the obstacleIdx describes the obstacle that was hit, or -1 if the event
	 * is a starting event or an out of bounds event.
	 */
	public static class BounceEvent {
		public double time;
		public double velocityX;
		public double velocityY;
		public double posX;
		public double posY;
		public int obstacleIdx;

		// Creates an starting bounce event.
		public BounceEvent(double startingHeight, double speed) {
			obstacleIdx = -1;
			posX = 0;
			posY = startingHeight;
			velocityX = speed;
			velocityY = 0.0;
			time = 0.0;
		}

		// Creates a copy of the bounce event sent in with updated position and
		// velocity.
		public BounceEvent(BounceEvent current, double time) {
			// Get all equations.
			UnivariateFunction[] ballFunctions
			 = BounceEvaluator.getAllFunctions(current);

			obstacleIdx = -1;
			posX = ballFunctions[0].value(time);
			velocityX = ballFunctions[1].value(time);
			posY = ballFunctions[2].value(time);
			velocityY = ballFunctions[3].value(time);
			this.time = time + current.time;
		}
	}

	private Parameters prms;
	private ObjectMapper mapper = new ObjectMapper();

	public BounceEvaluator(String prms) {
		super(prms);

		try {
			this.prms = mapper.readValue(prms, Parameters.class);
		} catch (Exception e) {
			e.printStackTrace(); // CAS FIX: Better error handling. Let's talk.
		}
	}

	// Constructor only for testing this class.
	private BounceEvaluator() {
		super("");
	}
	
	@Override
	public EvlPut[] evaluateSbms(Submit[] sbms) {
		EvlPut[] evaluations = new EvlPut[sbms.length];

		try {
			for (int i = 0; i < sbms.length; i++)
				evaluations[i] = evaluate(sbms[i]);
		} catch (Exception e) {
			e.printStackTrace();
			return new EvlPut[0];
		}

		return evaluations;
	}

	// Evaluate a list of ball speeds comprising a single sbm.
	private EvlPut evaluate(Submit sbm) throws Exception {
		LaunchSpec[] sbmData
		 = mapper.readValue(sbm.content, LaunchSpec[].class);
		int numBalls = sbmData.length;
		int obstacleCount = prms.obstacles.length;

		// Assign all obstacles ID numbers based on their index.
		for (int idx = 0; idx < obstacleCount; idx++)
			prms.obstacles[idx].obstacleId = idx;

		// Linked list so that we can delete obstacles as they are hit.
		LinkedList<Obstacle> obstacles
		 = new LinkedList<Obstacle>(Arrays.asList(prms.obstacles));

		BounceEvl rspB = new BounceEvl();
		
		// Double array of events, one array per ball
		rspB.events = new BounceEvent[numBalls][];

		EvlPut eval = new EvlPut(new Evl(), sbm.cmpId, sbm.teamId, sbm.id);

		double totalTime = 0.0;

		for (int i = 0; i < numBalls; i++) {
			// Set up starting ball event.
			BounceEvent startEvent
			 = new BounceEvent(STARTING_HEIGHT, sbmData[i].speed);

			// Gets all other events for a given ball and return an array starting
			// with event given.
			rspB.events[i] = calculateOneBall(obstacles, startEvent);
			totalTime += rspB.events[i][rspB.events[i].length - 1].time;
		}

		rspB.obstaclesHit = obstacleCount - obstacles.size();

		// Fill in score and array of arrays in response.
		if (obstacles.size() == 0)
			eval.eval.score = Math.round(prms.targetTime * 10000.0 / (totalTime + 10.0 * (numBalls - 1.0))) / 100.0;
		else
			eval.eval.score = 0;

		eval.eval.testResult = mapper.writeValueAsString(rspB);

		System.out.println("Graded Bounce Sbm# " + eval.sbmId);

		return eval;
	}

	private BounceEvent[] calculateOneBall(LinkedList<Obstacle> obstacles, BounceEvent StartingPoint) {
		// Linked list used for undefined size.
		LinkedList<BounceEvent> ballEvents = new LinkedList<BounceEvent>();
		ballEvents.add(StartingPoint);

		Collision nextCollision = getNextCollision(obstacles, StartingPoint);

		// Loops until there are no more collisions calculated.
		while (nextCollision != null) {
			ballEvents.add(calculateBallColision(ballEvents.getLast(), nextCollision));

			nextCollision = getNextCollision(obstacles, ballEvents.getLast());
		}

		// Calculate where the ball will go out of bounds.
		ballEvents.add(calculateBorderEvent(StartingPoint));

		// Return events as array, so that I can send the correct format as
		// response.
		return ballEvents.toArray(new BounceEvent[ballEvents.size()]);
	}

	// Returns the new ball event after calculating all values,
	// may return null, if no collisions occur.
	private BounceEvent calculateBallColision(BounceEvent current, Collision collision) {
		BounceEvent newBallEvent = new BounceEvent(current, collision.time);

		// Horizontal or vertical hits, mean just flip velocity.
		// Corner hit means calculate new x velocity and y velocity.
		switch (collision.hType) {
		case VERTICAL:
			newBallEvent.velocityX = -newBallEvent.velocityX;
			newBallEvent.obstacleIdx = collision.obstacleIdx;
			break;
		case HORIZONTAL:
			newBallEvent.velocityY = -newBallEvent.velocityY;
			newBallEvent.obstacleIdx = collision.obstacleIdx;
			break;
		case CORNER:
			double dx = (collision.xHit - newBallEvent.posX) / RADIUS;
			double dy = (collision.yHit - newBallEvent.posY) / RADIUS;

			// Magnitude of velocity component in collision direction.
			double magnitude = dx * newBallEvent.velocityX + dy * newBallEvent.velocityY;

			newBallEvent.velocityX = current.velocityX + (-2.0 * magnitude * dx);
			newBallEvent.velocityY = current.velocityY + (-2.0 * magnitude * dy);

			newBallEvent.obstacleIdx = collision.obstacleIdx;
			break;
		default:
			// should never happen
			return null;

		}

		System.out.println("Obstacle Hit is: " + newBallEvent.obstacleIdx);
		// CAS FIX: This might be a good time to start working with a logger. I've had
		// good luck
		// with Apache Commons logger. Let's put that into our Maven .pom and use it.
		return newBallEvent;
	}

	// Calculate where and when the ball will hit the border, last event.
	private BounceEvent calculateBorderEvent(BounceEvent current) {

		double xOutOfBounds;

		// Solve for y, as the ball goes one radius below the lower bound.
		double yOutOfBounds = quadraticSolution(GRAVITY / 2.0, current.velocityY, current.posY + RADIUS);

		// Solve for x + radius out of bounds.
		if (current.velocityX < 0.0)
			xOutOfBounds = (-RADIUS - current.posX) / current.velocityX;
		else if (current.velocityX > 0.0)
			xOutOfBounds = (100.0 + RADIUS - current.posX) / current.velocityX;
		else
			xOutOfBounds = Double.MAX_VALUE;

		double boundsTime = Math.min(xOutOfBounds, yOutOfBounds);

		return new BounceEvent(current, boundsTime);
	}

	// Return the next collision that occurs, also delete the obstacle.
	public Collision getNextCollision(LinkedList<Obstacle> obstacles, BounceEvent current) {

		// Create an array of collisions, so we can check all obstacles.
		Collision[] collisions = new Collision[obstacles.size()];

		// Check all obstacles for a collision.
		for (int i = 0; i < collisions.length; i++) {
			collisions[i] = getobstacleCollision(obstacles.get(i), current);
		}

		Collision firstCollision = getFirstCollision(collisions);

		if (firstCollision != null) {
			for (Obstacle obstacle : obstacles) {
				if (obstacle.obstacleId == firstCollision.obstacleIdx) {
					obstacles.remove(obstacle);
					break;
				}
			}
		}

		return firstCollision;
	}

	// Checks all edges, does not optimize by excluding edges and corners.
	// Calculates if the ball will hit the obstacle.
	private Collision getobstacleCollision(Obstacle obstacle, BounceEvent current) {
		Collision[] collisions = new Collision[8];

		// Check horizontal edge collisions.
		collisions[0] = getHorizontalEdgeCollision(obstacle.loX, obstacle.hiX, obstacle.hiY + RADIUS, current);
		collisions[1] = getHorizontalEdgeCollision(obstacle.loX, obstacle.hiX, obstacle.loY - RADIUS, current);

		// Check vertical edge collisions.
		collisions[2] = getVerticalEdgeCollision(obstacle.loY, obstacle.hiY, obstacle.hiX + RADIUS, current);
		collisions[3] = getVerticalEdgeCollision(obstacle.loY, obstacle.hiY, obstacle.loX - RADIUS, current);

		// Check all corners for collisions.
		collisions[4] = getCornerCollision(obstacle.hiX, obstacle.hiY, current);
		collisions[5] = getCornerCollision(obstacle.hiX, obstacle.loY, current);
		collisions[6] = getCornerCollision(obstacle.loX, obstacle.hiY, current);
		collisions[7] = getCornerCollision(obstacle.loX, obstacle.loY, current);

		Collision firsCollision = getFirstCollision(collisions);
		if (firsCollision != null)
			firsCollision.obstacleIdx = obstacle.obstacleId;

		return firsCollision;
	}

	// Calculates if the ball will hit any horizontal edge of the obstacle at y,
	// bounded by loX and hiX.
	private Collision getHorizontalEdgeCollision(double loX, double hiX, double y, BounceEvent current) {
		// Get equations for event.
		UnivariateFunction[] equations = getAllFunctions(current);

		// Get time when y value will be lined up with edge.
		double yHitTime = quadraticSolution(GRAVITY / 2.0, current.velocityY, current.posY - y);

		// Throw out negative times.
		if (yHitTime == Double.MAX_VALUE)
			return null;

		// Calculate x value at time of collision.
		double xValue = equations[0].value(yHitTime);

		if (GenUtil.inBounds(loX, xValue, hiX)) {
			// We have a hit on the horizontal edge.
			Collision collision = new Collision(yHitTime, Collision.HitType.HORIZONTAL, -1, -1);

			return collision;
		}

		return null;
	}

	// Calculates if the ball will hit any vertical edge of the obstacle at x,
	// bounded by loY and hiY.
	private Collision getVerticalEdgeCollision(double loY, double hiY, double x, BounceEvent current) {
		// Get equations for event.
		UnivariateFunction[] equations = getAllFunctions(current);

		// Get time when x value will be lined up with edge.
		double xHitTime = (x - current.posX) / current.velocityX;

		// Throw out negative times.
		if (xHitTime < 0)
			return null;

		// Get y value at possible collision time.
		double yValue = equations[2].value(xHitTime);

		if (GenUtil.inBounds(loY, yValue, hiY)) {
			Collision collision = new Collision(xHitTime, Collision.HitType.VERTICAL, -1, -1);

			return collision;
		}

		return null;
	}

	// Calculates if the ball will hit any edge of the obstacle.
	private Collision getCornerCollision(double x, double y, BounceEvent current) {

		PolynomialFunction cornerEquation = getPolynomial(current, x, y);

		LaguerreSolver solver = new LaguerreSolver();

		Complex[] solutions = solver.solveAllComplex(cornerEquation.getCoefficients(), 0);

		Double timeOfImpact = simplifyComplex(current.time, solutions);

		// We hit a corner
		if (timeOfImpact != null) {
			Collision collision = new Collision(timeOfImpact, Collision.HitType.CORNER, x, y);

			return collision;
		}

		return null;
	}

	// Function takes an array of collisions, and returns the first,
	// any can be null.
	private Collision getFirstCollision(Collision[] collisions) {
		Collision firstCollision = null;

		for (int i = 0; i < collisions.length; i++)
			if (collisions[i] != null)
				if (firstCollision == null || firstCollision.time > collisions[i].time)
					firstCollision = collisions[i];

		return firstCollision;
	}

	// Helper for the LaguerreSolver, returns the lowest time that is greater
	// than currentTime and not a complex number.
	public Double simplifyComplex(double currentTime, Complex[] solutions) {
		Double lowestTime = null;

		for (int i = 0; i < solutions.length; i++)
			if (Math.abs(solutions[i].getImaginary()) < ZERO)
				if ((solutions[i].getReal() > currentTime
						&& (lowestTime == null || lowestTime.doubleValue() > solutions[i].getReal())))
					lowestTime = solutions[i].getReal();

		return lowestTime;
	}

	/*
	 * GetCoefficients, will return a PolynomialFunction used for the solver the
	 * equation represents the distance to a corner represented by a point.
	 * 
	 * The equation is:
	 * 
	 * (Dx + tVx)^2 + (Dy + tVy - 4.9t^2)^2 = r^2
	 * 
	 * Where: Dx = (Px - Cx) Px = current position of ball along x-axis Cx =
	 * thecorner's x value Vx = the ball's current velocity along the x-axis Dy =
	 * (pY - Cy) Py = current position of ball along y-axis Cy = the corners y value
	 * Vy = the ball's current velocity along the y-axis r = radius of the ball
	 * 
	 * The equation results to:
	 * 
	 * (4.9)^2t^4 + (-9.8Vy)t^3 + (Vy^2 + Vx^2 - 9.8Dy)t^2 + 2(DyVy + DxVx)t + (Dy^2
	 * + Dx^2 + r^2) = r
	 * 
	 * The polynomial function will get an array of doubles based on the values in
	 * the equation above.
	 */
	public PolynomialFunction getPolynomial(BounceEvent event, double cX, double cY) {
		double[] coef = new double[5];

		double dY = (event.posY - cY);
		double dX = (event.posX - cX);

		// Coefficient of t^0
		coef[0] = GenUtil.square(dX) + GenUtil.square(dY) - GenUtil.square(RADIUS);

		// Coefficient of t^1
		coef[1] = 2 * (dY * event.velocityY + dX * event.velocityX);

		// Coefficient of t^2
		coef[2] = GenUtil.square(event.velocityY) + GenUtil.square(event.velocityX) + GRAVITY * dY;

		// Coefficient of t^3
		coef[3] = (GRAVITY * event.velocityY);

		// Coefficient of t^4
		coef[4] = GenUtil.square(GRAVITY / 2.0);

		return new PolynomialFunction(coef);
	}

	// Returns an array with [xPosFunction, xVelocityFunction, yPositionFunction,
	// and yVelocityFunction].
	//
	// CAS FIX: This is a clever use of lambdas, and I'm good with it after
	// seeing what you need to do.  But, how about returning a class with named fields
	// instead of an array with blind-meanings for 0, 1, 2, and 3.
	public static UnivariateFunction[] getAllFunctions(BounceEvent current) {
		UnivariateFunction[] ballFunctions = new UnivariateFunction[4];

		// X position function
		ballFunctions[0] = t -> t * current.velocityX + current.posX;
		// X velocity function
		ballFunctions[1] = t -> current.velocityX;
		// Y position function
		ballFunctions[2] = t -> GRAVITY / 2.0 * GenUtil.square(t) + current.velocityY * t + current.posY;
		// Y velocity function
		ballFunctions[3] = t -> 2 * GRAVITY / 2.0 * t + current.velocityY;

		return ballFunctions;
	}

	// Return lowest positive real root, or Double.MAX_VALUE if no root qualifies.
	public static double quadraticSolution(double a, double b, double c) {
		double d = b * b - 4 * a * c;
		double root1;
		double root2;

		if (d >= 0) {
			root1 = (-b + Math.sqrt(d)) / (2 * a);
			root2 = (-b - Math.sqrt(d)) / (2 * a);
			if (root1 >= 0 || root2 >= 0)
				if (root2 < 0)
					return root1;
				else if (root1 < 0)
					return root2;
				else
					return (root1 > root2) ? root2 : root1;
		}

		// Imaginary solution should rarely occur.
		return Double.MAX_VALUE;
	}

	// Tester main, used only to test functions
	public static void main(String[] args) {
		// Test obstacles to use
		LinkedList<Obstacle> obstacles = new LinkedList<Obstacle>();
		Obstacle plat = new Obstacle();

		plat.hiX = 60;
		plat.loX = 50;
		plat.hiY = 10;
		plat.loY = 0;
		plat.obstacleId = 0;

		obstacles.add(plat);

		BounceEvent start = new BounceEvent(STARTING_HEIGHT, 10);
		start.posX = 10;
		start.posY = 10;
		start.velocityX = 5;
		start.velocityY = 50;

		BounceEvaluator eval = new BounceEvaluator();

		Collision testCollision = eval.getobstacleCollision(plat, start);

		if (testCollision != null) {
			System.out.println(testCollision.hType);
			System.out.println(testCollision.xHit);
			System.out.println(testCollision.yHit);
		} else {
			System.out.println("miss");
		}

		double x = 10;
		double y = 15;

		Collision cornerTest = eval.getCornerCollision(x, y, start);

		System.out.println("");
		if (cornerTest != null) {
			System.out.println(cornerTest.hType);
			System.out.println(cornerTest.xHit);
			System.out.println(cornerTest.yHit);
		} else {
			System.out.println("miss Corner");
		}
	}

}
