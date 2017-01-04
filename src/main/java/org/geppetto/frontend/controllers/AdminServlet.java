package org.geppetto.frontend.controllers;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.List;
import java.util.TimeZone;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.shiro.SecurityUtils;
import org.apache.shiro.subject.Subject;
import org.geppetto.core.common.GeppettoInitializationException;
import org.geppetto.core.data.DataManagerHelper;
import org.geppetto.core.data.IGeppettoDataManager;
import org.geppetto.core.data.model.ExperimentStatus;
import org.geppetto.core.data.model.IExperiment;
import org.geppetto.core.data.model.IGeppettoProject;
import org.geppetto.core.data.model.IUser;
import org.geppetto.core.data.model.UserPrivileges;
import org.geppetto.core.manager.IGeppettoManager;
import org.geppetto.core.s3.S3Manager;
import org.geppetto.frontend.controllers.objects.AdminErrorObject;
import org.geppetto.frontend.controllers.objects.AdminSimulationObject;
import org.geppetto.frontend.controllers.objects.AdminUserObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
public class AdminServlet {
	private static Log logger = LogFactory.getLog(AdminServlet.class);

	@Autowired
	private IGeppettoManager geppettoManager;
	
	@RequestMapping(value = "/admin", method = RequestMethod.GET)
	public String admin() throws GeppettoInitializationException
	{
		Subject currentUser = SecurityUtils.getSubject();
		if(geppettoManager.getUser() != null && currentUser.isAuthenticated())
		{
			IUser user = geppettoManager.getUser();
			List<UserPrivileges> privileges = user.getUserGroup().getPrivileges();
			if(privileges.contains(UserPrivileges.ADMIN)){
				return "dist/admin";
			}
		}
		
		return "redirect:http://www.geppetto.org";
	}
	
	@RequestMapping(value = "/user/{login}/users")
	public @ResponseBody Collection<? extends AdminUserObject> getUsers(@PathVariable("login") String login)
	{
		Subject currentUser = SecurityUtils.getSubject();
		if(geppettoManager.getUser() != null && currentUser.isAuthenticated())
		{
			IGeppettoDataManager dataManager = DataManagerHelper.getDataManager();
			List<? extends IUser> users = null;
			List<AdminUserObject> userObjects = new ArrayList<AdminUserObject>();
			if(dataManager != null)
			{
				users =  dataManager.getAllUsers();
				
			}
			
			AdminUserObject userObject;
			List<? extends IGeppettoProject> projects;
			for(IUser user: users){
				int projectsSize = 0;
				int experiments = 0;
				long totalSize = 0;
				userObject = new AdminUserObject();
				if(user.getGeppettoProjects() !=null){
					projects = user.getGeppettoProjects();
					for(IGeppettoProject p : projects){
						totalSize  += S3Manager.getInstance().getFileStorage("projects/"+p.getId()+"/");
						experiments += p.getExperiments().size();
					}
					projectsSize = projects.size();
				}
				userObject.setLogin(user.getLogin());
				userObject.setProjects(projectsSize);
				userObject.setExperiments(experiments);
				userObject.setName(user.getName());
				userObject.setLastLogin(user.getLastLogin());
				userObject.setStorage(getStorageSize(totalSize));
				userObjects.add(userObject);
			}
			
			Collections.sort(userObjects, new Comparator<AdminUserObject>() {

				SimpleDateFormat formatDate = new SimpleDateFormat("EE MMM dd HH:mm:ss z yyyy");

				@Override
				public int compare(AdminUserObject o1, AdminUserObject o2) {
					Date date = null, date2 = null;
					formatDate.setTimeZone(TimeZone.getTimeZone("GMT"));
					try {
						date = formatDate.parse(o1.getLastLogin());
						date2 = formatDate.parse(o2.getLastLogin());						
					} catch (ParseException e) {
						e.printStackTrace();
					}
					return date.compareTo(date2);
				}
			});
			return userObjects;
		}
				
		return null;
	}

	@RequestMapping(value = "/user/{login}/simulations")
	public @ResponseBody Collection<? extends AdminSimulationObject> getSimulations(@PathVariable("login") String login)
	{
		Subject currentUser = SecurityUtils.getSubject();
		if(geppettoManager.getUser() != null && currentUser.isAuthenticated())
		{
			IGeppettoDataManager dataManager = DataManagerHelper.getDataManager();
			Collection<? extends IUser> users = null;
			List<AdminSimulationObject> simulationObjects = new ArrayList<AdminSimulationObject>();
			if(dataManager != null)
			{
				users =  dataManager.getAllUsers();
				List<? extends IGeppettoProject> projects;
				List<? extends IExperiment> experiments;
				String totalExperiments = "";
				String totalSimulators = "";
				String simulator;
				for(IUser user: users){
					long totalSize = 0;
					projects = user.getGeppettoProjects();
					for(IGeppettoProject p : projects){
						totalSize  += S3Manager.getInstance().getFileStorage("projects/"+p.getId()+"/");
						experiments = p.getExperiments();
						for(IExperiment e : experiments){
							simulator = e.getAspectConfigurations().get(0).getSimulatorConfiguration().getSimulatorId();
							if(e.getLastRan()!=null){
								AdminSimulationObject simulation = new AdminSimulationObject();
								simulation.setName(user.getName());
								simulation.setExperiment(e.getName());
								simulation.setLogin(user.getLogin());
								simulation.setExperimentLastRun(e.getLastModified().toString());
								simulation.setSimulator(simulator);
								simulation.setStatus(e.getStatus().toString());
								simulation.setStorage(getStorageSize(totalSize));
								simulationObjects.add(simulation);								
							}
							totalExperiments+= e.getName()+'\n';
							totalSimulators+= simulator+'\n';
						}
					}

					for(AdminSimulationObject object : simulationObjects){
						object.setExperiments(totalExperiments);
						object.setSimulators(totalSimulators);
					}
					totalExperiments = "";
					totalSimulators="";
				}
			}
			return simulationObjects;
		}
				
		return null;
	}
	
	private String getStorageSize(long size){
		String storageUnit=" KB";
		double formattedSize =0;
		formattedSize = size/1024;
		if(formattedSize>1000){
			formattedSize = formattedSize/1024;
			storageUnit=" MB";
		}else if(formattedSize>1000000){
			formattedSize = formattedSize/1024/104;
			storageUnit=" GB";
		}
		
		return String.format( "%.2f", formattedSize )+storageUnit;
	}
	
	@RequestMapping(value = "/user/{login}/errors")
	public @ResponseBody Collection<? extends AdminErrorObject> getErrors(@PathVariable("login") String login)
	{
		Subject currentUser = SecurityUtils.getSubject();
		if(geppettoManager.getUser() != null && currentUser.isAuthenticated())
		{
			IGeppettoDataManager dataManager = DataManagerHelper.getDataManager();
			Collection<? extends IUser> users = null;
			List<AdminErrorObject> errorObjects = new ArrayList<AdminErrorObject>();
			if(dataManager != null)
			{
				users =  dataManager.getAllUsers();
				List<? extends IGeppettoProject> projects;
				List<? extends IExperiment> experiments;
				for(IUser user: users){
					projects = user.getGeppettoProjects();
					for(IGeppettoProject p : projects){
						experiments = p.getExperiments();
						for(IExperiment e : experiments){
							if(e.getStatus() == ExperimentStatus.ERROR){
								AdminErrorObject error = new AdminErrorObject();
								error.setName(user.getName());
								error.setExperiment(e.getName());
								error.setLogin(user.getLogin());
								error.setError(e.getDetails());
								error.setSimulator(e.getAspectConfigurations().get(0).getSimulatorConfiguration().getSimulatorId());
								errorObjects.add(error);
							}
						}
					}
				}
			}
			return errorObjects;
		}
				
		return null;
	}
}
