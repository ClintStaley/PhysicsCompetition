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
}
