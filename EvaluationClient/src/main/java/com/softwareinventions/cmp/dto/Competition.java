package com.softwareinventions.cmp.dto;

// CAS FIX: Pls remove tabs here and elsewhere.
public class Competition {
	private int id;
	private int ownerId;
	private int ctpId;
	private String title;
   private String prms;
   private int rules;
   
   public int getId() {return id;}
   public int getCtpId() {return ctpId;}
   public int getOwnerId() {return ownerId;}
   public String getTitle() {return title;}
   public String getPrms() {return prms;}
   public int getRules() {return rules;}

   
   public void setId(int newId) {id = newId;}
   public void setTitle(String newTitle) {title = newTitle;}
   public void setOwnerId(int newOwnerId) {ownerId = newOwnerId;}
   public void setCtpId(int newCtpId) {ctpId = newCtpId;}
   public void setPrms(String newPrms) {prms = newPrms;}
   public void setRules(int newRules) {rules = newRules;}
   
}
