package com.softwareinventions.cmp.util;

// Special exception class for EVC.  Allows attachment of causative Throwable
// if any.
public class EVCException extends Exception {
   /**
    * 
    */
   private static final long serialVersionUID = 1L;

   public EVCException(String arg0) {
      super(arg0);
   }

   public EVCException(String arg0, Throwable arg1) {
      super(arg0, arg1);
   }
   
   public EVCException(Throwable cause) {
      super(cause);
   }
}
