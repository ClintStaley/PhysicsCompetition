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
}
