interface yourmom
{
	public String canidothis();
}

class yesican implements yourmom
{
	public String canidothis()
	{
		return "yes i can";
	}
	
}

class areyousure extends yesican
{
	public String yesican()
	{
		return ", do this that is.";
	}
}

public class cani
{
	public static void main(String[] args)
	{
		areyousure yes = new areyousure();
		
		System.out.println(yes.canidothis() + yes.yesican());
	}
}