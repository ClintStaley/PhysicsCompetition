package com.softwareinventions.cmp.dto;

public class CompetitionType {
   private int id;
   private String title;
   private String description;
   private String prmSchema; 
   
   public int getId() {return id;}
   public String getTitle() {return title;}
   public String getDescription() {return description;}
   public String getPrmSchema() {return prmSchema;}
   
   public void setId(int newId) {id = newId;}
   public void setTitle(String newTitle) {title = newTitle;}
   public void setDescription(String newDesc) {description = newDesc;}
   public void setPrmSchema(String newSchema) {prmSchema = newSchema;}
}
