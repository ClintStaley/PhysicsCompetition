package com.softwareinventions.cmp.dto;

import java.util.Date;

public class Submit {
   public int id;
   public int cmpId;
   public String content;
   public String testResult;
   public int teamId;
   public int score;
   public Date sbmTime;
   public boolean practiceRun;
   public String errorResult;
   
   //teamProperties
   public int numSubmits;
   public Date lastSubmit;
   public int bestScore;
}
