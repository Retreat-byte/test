import java.util.ArrayList;

public class Class {
    private String classname;
    private ArrayList<Group>group;
    private ArrayList<Student>student;
    public Class(String classname)
    {
        this.classname=classname;
        group=new ArrayList<>();
        student=new ArrayList<>();
    }
    public void addgroup(Group p)
    {
        group.add(p);
    }
    public void addstudent(Student p)
    {
        student.add(p);
    }
    public ArrayList<Group> getGroup()
    {
        return this.group;
    }
    public ArrayList<Student> getStudent()
    {
        return this.student;
    }
    public String getClassname() {
        return classname;
    }
    public void setClassname(String classname) {
        this.classname = classname;
    }

}
