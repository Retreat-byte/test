//小组管理包括：新增小组、维护小组、小组列表。
import java.util.ArrayList;
public class Group {
    private String groupname;
    private ArrayList<Student>arr;
    private int garde;
    public Group(String name)
    {
        this.groupname=name;
        this.arr=new ArrayList<>();
    }
    public ArrayList<Student> getstudent()
    {
        return this.arr;
    }
    public String getGroupname() {
        return groupname;
    }

    public void setGroupname(String groupname) {
        this.groupname = groupname;
    }
    public void addstudent(Student p)
    {
        arr.add(p);
    }

    public int getGarde() {
        return garde;
    }

    public void setGarde(int garde) {
        this.garde = garde;
    }
}
