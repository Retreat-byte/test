import java.util.ArrayList;
import java.util.Random;
public class Randomselect {
    Random random = new Random();
    public void randomgroup(Class p)
    {
        ArrayList<Group> r=p.getGroup();
        Group group =r.get(random.nextInt(r.size()));
        System.out.println(group.getGroupname());
    }
    public void randomstudent(Class p)
    {
        ArrayList<Student> b=p.getStudent();
        Student student1=b.get(random.nextInt(b.size()));
        System.out.println(student1.getName());
    }
    public void groupstudent(Group p)
    {
        ArrayList<Student> s=p.getstudent();
        Student student =s.get(random.nextInt(s.size()));
        System.out.println(student.getName());
    }
}
