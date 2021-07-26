package com.softwareinventions.cmp.util;

public class GenUtil {

   public static double sqr(double num) {
      return num * num;
   }
   
   public static double cube(double num) {
      return num * num * num;
   }
   
   public static boolean inBounds(double lo, double val, double hi) {
	   return lo <= val && val <= hi;
   }
   
   public static boolean looseEqual(double val1, double val2, double eps) {
      return val1 <= val2 + eps && val2 <= val1 + eps;
   }
   
   // Return solutions to the quadratic equation as an array of doubles, in 
   // ascending order, if no solutions exist return null.
   public static double[] quadraticSolution(double a, double b, double c) {
      double d = b * b - 4 * a * c;
      double root1;
      double root2;
      double[] solution = null;

      if (d >= 0) {
         root1 = (-b + Math.sqrt(d)) / (2 * a);
         root2 = (-b - Math.sqrt(d)) / (2 * a);
         
         solution = new double[2];
         solution[0] = Math.min(root1, root2);
         solution[1] = Math.max(root1, root2);
      }

      return solution;
   }
}
