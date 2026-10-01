import React, { useEffect, useMemo, useState } from "react";
import {
  Alert, SafeAreaView, View, Text, StyleSheet, Pressable, ScrollView,
  TextInput, Switch, ActivityIndicator
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "./lib/supabase";

const tabs = [
  { id:"home", label:"Home", icon:"grid-outline" },
  { id:"ai", label:"AI", icon:"sparkles-outline" },
  { id:"games", label:"Games", icon:"game-controller-outline" },
  { id:"social", label:"Social", icon:"people-outline" },
  { id:"create", label:"Create", icon:"add-circle-outline" }
];

const modules = [
  ["AI","sparkles","Ask, build, brainstorm and automate."],
  ["Games","game-controller","Play, compete and discover."],
  ["Social","people","Friends, communities and messages."],
  ["Create","color-palette","Make sites, music, art and more."],
  ["Market","bag-handle","Discover products and digital drops."],
  ["Mystery","lock-closed","Hidden layers, puzzles and events."]
];

function Card({children,style,onPress}) {
  return <Pressable onPress={onPress} style={({pressed})=>[
    styles.card,style,pressed&&{opacity:.82,transform:[{scale:.985}]}
  ]}>{children}</Pressable>;
}

function Auth({onDone}) {
  const [mode,setMode]=useState("signin");
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [displayName,setDisplayName]=useState("");
  const [loading,setLoading]=useState(false);

  async function submit() {
    if (!email.trim() || password.length < 6) {
      Alert.alert("NOVA", "Enter a valid email and a password with at least 6 characters.");
      return;
    }
    setLoading(true);
    const result = mode === "signin"
      ? await supabase.auth.signInWithPassword({email:email.trim(),password})
      : await supabase.auth.signUp({
          email:email.trim(),
          password,
          options:{data:{display_name:displayName.trim() || undefined}}
        });
    setLoading(false);
    if (result.error) return Alert.alert("NOVA", result.error.message);
    if (mode === "signup" && !result.data.session) {
      Alert.alert("Check your email", "Your account was created. Confirm your email, then sign in.");
      setMode("signin");
      return;
    }
    onDone(result.data.session);
  }

  return <SafeAreaView style={styles.root}>
    <StatusBar style="light"/>
    <ScrollView contentContainerStyle={styles.authScroll}>
      <Text style={styles.authLogo}>NOVA</Text>
      <Text style={styles.authTitle}>{mode==="signin" ? "Welcome back." : "Enter the NOVA."}</Text>
      <Text style={styles.muted}>Your world. One app.</Text>
      {mode==="signup" && <TextInput value={displayName} onChangeText={setDisplayName} placeholder="Display name" placeholderTextColor="#777" style={styles.input}/>}
      <TextInput value={email} onChangeText={setEmail} placeholder="Email" placeholderTextColor="#777" autoCapitalize="none" keyboardType="email-address" style={styles.input}/>
      <TextInput value={password} onChangeText={setPassword} placeholder="Password" placeholderTextColor="#777" secureTextEntry autoCapitalize="none" style={styles.input}/>
      <Pressable disabled={loading} onPress={submit} style={[styles.primary,loading&&{opacity:.5}]}>
        {loading ? <ActivityIndicator color="#09090B"/> : <Text style={styles.primaryText}>{mode==="signin" ? "Sign in" : "Create account"}</Text>}
      </Pressable>
      <Pressable onPress={()=>setMode(mode==="signin"?"signup":"signin")} style={styles.authSwitch}>
        <Text style={styles.muted}>{mode==="signin" ? "Need an account? " : "Already have an account? "}
          <Text style={styles.authLink}>{mode==="signin" ? "Create one" : "Sign in"}</Text>
        </Text>
      </Pressable>
    </ScrollView>
  </SafeAreaView>;
}

function Home({go,profile}) {
  return <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
    <View style={styles.top}>
      <View><Text style={styles.eyebrow}>NOVA / 01</Text><Text style={styles.title}>Hey, <Text style={styles.accent}>{profile?.display_name || profile?.username || "creator"}.</Text></Text></View>
      <Pressable style={styles.avatar}><Text style={styles.avatarText}>{(profile?.display_name || profile?.username || "N")[0].toUpperCase()}</Text></Pressable>
    </View>
    <View style={styles.hero}><View style={styles.glow}/><Text style={styles.heroTag}>THE DIGITAL ECOSYSTEM</Text><Text style={styles.heroTitle}>Everything you want to do, connected.</Text><Text style={styles.muted}>AI, games, social, creativity and hidden worlds — built into one pocket universe.</Text><Pressable style={styles.primary} onPress={()=>go("ai")}><Ionicons name="sparkles" size={17} color="#09090B"/><Text style={styles.primaryText}>Open NOVA AI</Text></Pressable></View>
    <View style={styles.sectionHead}><Text style={styles.sectionTitle}>Explore</Text><Text style={styles.mutedSmall}>6 modules</Text></View>
    <View style={styles.grid}>{modules.map(([name,icon,desc])=><Card key={name} onPress={()=>go(name.toLowerCase())} style={styles.module}><View style={styles.iconBubble}><Ionicons name={icon} size={21} color="#fff"/></View><Text style={styles.moduleTitle}>{name}</Text><Text style={styles.moduleDesc}>{desc}</Text></Card>)}</View>
    <View style={styles.sectionHead}><Text style={styles.sectionTitle}>Live now</Text><Text style={styles.mutedSmall}>03</Text></View>
    <Card><Text style={styles.live}>● LIVE EVENT</Text><Text style={styles.eventTitle}>The first signal</Text><Text style={styles.muted}>A strange message appeared in the NOVA network.</Text><View style={styles.row}><Text style={styles.link}>Investigate</Text><Ionicons name="arrow-forward" size={16} color="#fff"/></View></Card>
  </ScrollView>;
}

function AI({user}) {
  const [q,setQ]=useState("");
  async function savePrompt() {
    if (!q.trim()) return;
    const {error}=await supabase.from("projects").insert({user_id:user.id,name:q.trim(),kind:"ai_prompt",data:{prompt:q.trim()}});
    if(error) Alert.alert("NOVA AI",error.message); else { Alert.alert("Saved","Prompt saved to your NOVA projects."); setQ(""); }
  }
  return <ScrollView contentContainerStyle={styles.scroll}><Text style={styles.pageTitle}>NOVA AI</Text><Text style={styles.muted}>Your assistant, creator and command centre.</Text><View style={styles.aiBox}><Ionicons name="sparkles" size={24} color="#fff"/><Text style={styles.aiBig}>What are we making?</Text><Text style={styles.muted}>Your prompts can now be saved to your Supabase projects.</Text><TextInput value={q} onChangeText={setQ} placeholder="Try “make me a game idea”" placeholderTextColor="#777" style={styles.input}/><Pressable style={styles.primary} onPress={savePrompt}><Text style={styles.primaryText}>Save prompt</Text><Ionicons name="arrow-forward" size={17} color="#09090B"/></Pressable></View><Text style={styles.sectionTitle}>Tools</Text>{["Chat","Image studio","Code builder","Music lab","Agents"].map((x,i)=><Card key={x} style={styles.tool}><View style={styles.iconBubble}><Ionicons name={["chatbubble","image","code-slash","musical-notes","flash"][i]} size={18} color="#fff"/></View><View style={{flex:1}}><Text style={styles.moduleTitle}>{x}</Text><Text style={styles.moduleDesc}>Ready to use</Text></View><Ionicons name="chevron-forward" size={18} color="#777"/></Card>)}</ScrollView>;
}

function Games({user}) {
  async function score(game) {
    const {error}=await supabase.from("game_scores").insert({user_id:user.id,game,score:Math.floor(Math.random()*9000)+1000});
    if(error) Alert.alert("Games",error.message); else Alert.alert("Score saved","Your score was added to the NOVA leaderboard.");
  }
  return <ScrollView contentContainerStyle={styles.scroll}><Text style={styles.pageTitle}>Games</Text><Text style={styles.muted}>Play, compete and discover.</Text><View style={styles.gameHero}><Text style={styles.heroTag}>FEATURED</Text><Text style={styles.heroTitle}>NOVA ARENA</Text><Text style={styles.muted}>Fast browser games. Global leaderboards. Daily challenges.</Text><Pressable style={styles.primary} onPress={()=>score("NOVA Arena")}><Text style={styles.primaryText}>Record score</Text></Pressable></View><Text style={styles.sectionTitle}>Your games</Text>{["RIFT","Signal Rush","Pixel Panic"].map((x,i)=><Card key={x} onPress={()=>score(x)} style={styles.tool}><View style={styles.gameIcon}><Text>{["⚡","◉","✦"][i]}</Text></View><View style={{flex:1}}><Text style={styles.moduleTitle}>{x}</Text><Text style={styles.moduleDesc}>{i===0?"2v2 build + fight":"Arcade • multiplayer"}</Text></View><Text style={styles.play}>PLAY</Text></Card>)}</ScrollView>;
}

function Social({user,profile}) {
  const [posts,setPosts]=useState([]);
  const [text,setText]=useState("");
  async function load(){const {data}=await supabase.from("posts").select("id,content,created_at,profiles(display_name,username)").order("created_at",{ascending:false}).limit(20); if(data)setPosts(data);}
  useEffect(()=>{load(); const ch=supabase.channel("nova-posts").on("postgres_changes",{event:"*",schema:"public",table:"posts"},load).subscribe(); return()=>{supabase.removeChannel(ch)}},[]);
  async function post(){if(!text.trim())return; const {error}=await supabase.from("posts").insert({user_id:user.id,content:text.trim()}); if(error)Alert.alert("Social",error.message);else{setText("");load();}}
  return <ScrollView contentContainerStyle={styles.scroll}><Text style={styles.pageTitle}>Social</Text><Text style={styles.muted}>Your people, your spaces.</Text><Card style={{marginTop:20}}><View style={styles.row}><View style={styles.avatar}><Text style={styles.avatarText}>{(profile?.display_name||profile?.username||"N")[0].toUpperCase()}</Text></View><View style={{flex:1,marginLeft:12}}><Text style={styles.moduleTitle}>{profile?.display_name||profile?.username||"NOVA user"}</Text><Text style={styles.moduleDesc}>Connected to Supabase</Text></View></View></Card><View style={styles.postBox}><TextInput value={text} onChangeText={setText} placeholder="Share something with NOVA..." placeholderTextColor="#777" style={styles.input}/><Pressable style={styles.primary} onPress={post}><Text style={styles.primaryText}>Post</Text></Pressable></View><Text style={styles.sectionTitle}>Community feed</Text>{posts.length===0?<Text style={styles.muted}>No posts yet. Be the first.</Text>:posts.map(p=><Card key={p.id}><Text style={styles.moduleTitle}>{p.profiles?.display_name||p.profiles?.username||"NOVA user"}</Text><Text style={[styles.muted,{marginTop:7}]}>{p.content}</Text></Card>)}</ScrollView>;
}

function Create({user}) {
  async function create(kind){const {error}=await supabase.from("projects").insert({user_id:user.id,name:"Untitled "+kind,kind,data:{}});if(error)Alert.alert("Create",error.message);else Alert.alert("Created",kind+" project saved to your NOVA workspace.");}
  return <ScrollView contentContainerStyle={styles.scroll}><Text style={styles.pageTitle}>Create</Text><Text style={styles.muted}>Turn ideas into things people can use.</Text><View style={styles.grid}>{["Website","Graphic","Music","Avatar","Video","Game"].map((x,i)=><Card key={x} onPress={()=>create(x)} style={styles.module}><View style={styles.iconBubble}><Ionicons name={["globe","brush","musical-notes","person","videocam","game-controller"][i]} size={20} color="#fff"/></View><Text style={styles.moduleTitle}>{x}</Text><Text style={styles.moduleDesc}>Create a saved NOVA project.</Text></Card>)}</View></ScrollView>;
}

function Settings({onSignOut}) {
  const [dark,setDark]=useState(true);
  return <ScrollView contentContainerStyle={styles.scroll}><Text style={styles.pageTitle}>Settings</Text><Text style={styles.muted}>Make NOVA yours.</Text>{[["Dark appearance",dark,setDark],["Notifications",true,()=>{}],["Haptics",true,()=>{}]].map(([x,v,set],i)=><Card key={x} style={styles.tool}><View style={{flex:1}}><Text style={styles.moduleTitle}>{x}</Text><Text style={styles.moduleDesc}>{i===0?"Use the dark NOVA interface":"Stay in the loop"}</Text></View><Switch value={v} onValueChange={set}/></Card>)}<Pressable onPress={onSignOut} style={styles.signOut}><Ionicons name="log-out-outline" size={18} color="#fff"/><Text style={styles.signOutText}>Sign out</Text></Pressable></ScrollView>;
}

export default function App() {
  const [session,setSession]=useState(null);
  const [profile,setProfile]=useState(null);
  const [tab,setTab]=useState("home");
  const [settings,setSettings]=useState(false);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    supabase.auth.getSession().then(({data})=>{setSession(data.session);setLoading(false);});
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,s)=>setSession(s));
    return()=>subscription.unsubscribe();
  },[]);

  useEffect(()=>{
    if(!session){setProfile(null);return;}
    supabase.from("profiles").select("*").eq("id",session.user.id).single().then(({data})=>setProfile(data));
  },[session]);

  if(loading) return <SafeAreaView style={styles.root}><View style={styles.loading}><Text style={styles.authLogo}>NOVA</Text><ActivityIndicator color="#A78BFA" size="large"/></View></SafeAreaView>;
  if(!session) return <Auth onDone={setSession}/>;

  const content=useMemo(()=>{
    if(settings)return <Settings onSignOut={()=>supabase.auth.signOut()}/>;
    if(tab==="home")return <Home go={(x)=>setTab(["social","games","create","ai"].includes(x)?x:"home")} profile={profile}/>;
    if(tab==="ai")return <AI user={session.user}/>;
    if(tab==="games")return <Games user={session.user}/>;
    if(tab==="social")return <Social user={session.user} profile={profile}/>;
    return <Create user={session.user}/>;
  },[tab,settings,session,profile]);

  return <SafeAreaView style={styles.root}><StatusBar style="light"/><View style={styles.content}>{content}</View>{!settings&&<View style={styles.nav}>{tabs.map(t=><Pressable key={t.id} onPress={()=>setTab(t.id)} style={styles.navItem}><Ionicons name={t.icon} size={22} color={tab===t.id?"#fff":"#666"}/><Text style={[styles.navText,tab===t.id&&styles.navActive]}>{t.label}</Text></Pressable>)}<Pressable onPress={()=>setSettings(true)} style={styles.navItem}><Ionicons name="settings-outline" size={22} color="#666"/><Text style={styles.navText}>Settings</Text></Pressable></View>}{settings&&<Pressable onPress={()=>setSettings(false)} style={styles.back}><Ionicons name="arrow-back" size={20} color="#fff"/><Text style={styles.backText}>Back to NOVA</Text></Pressable>}</SafeAreaView>;
}

const styles=StyleSheet.create({
root:{flex:1,backgroundColor:"#07070A"},content:{flex:1},loading:{flex:1,alignItems:"center",justifyContent:"center",gap:20},
authScroll:{flexGrow:1,justifyContent:"center",padding:24},authLogo:{color:"#fff",fontSize:36,fontWeight:"900",letterSpacing:5,marginBottom:20},authTitle:{color:"#fff",fontSize:30,fontWeight:"850",marginBottom:6},authSwitch:{alignItems:"center",marginTop:20},authLink:{color:"#A78BFA",fontWeight:"800"},
scroll:{padding:20,paddingBottom:110},top:{flexDirection:"row",justifyContent:"space-between",alignItems:"center",marginBottom:22},eyebrow:{fontSize:11,color:"#777",letterSpacing:2,fontWeight:"800"},title:{fontSize:29,color:"#fff",fontWeight:"800",letterSpacing:-1},accent:{color:"#A78BFA"},avatar:{width:42,height:42,borderRadius:21,backgroundColor:"#18181D",alignItems:"center",justifyContent:"center",borderWidth:1,borderColor:"#292930"},avatarText:{color:"#fff",fontWeight:"800"},hero:{overflow:"hidden",borderRadius:26,padding:22,backgroundColor:"#111116",borderWidth:1,borderColor:"#27272F",marginBottom:26},glow:{position:"absolute",width:180,height:180,borderRadius:90,backgroundColor:"#4C1D95",opacity:.22,right:-40,top:-60},heroTag:{color:"#A78BFA",fontSize:10,fontWeight:"900",letterSpacing:2,marginBottom:10},heroTitle:{fontSize:25,lineHeight:30,color:"#fff",fontWeight:"800",letterSpacing:-.7,marginBottom:8},muted:{color:"#8A8A94",fontSize:14,lineHeight:21},mutedSmall:{color:"#666",fontSize:12},primary:{marginTop:18,alignSelf:"flex-start",backgroundColor:"#fff",paddingHorizontal:16,paddingVertical:11,borderRadius:14,flexDirection:"row",alignItems:"center",gap:8},primaryText:{color:"#09090B",fontWeight:"800",fontSize:13},sectionHead:{flexDirection:"row",justifyContent:"space-between",alignItems:"center",marginBottom:12},sectionTitle:{color:"#fff",fontWeight:"800",fontSize:18,marginTop:12,marginBottom:12},grid:{flexDirection:"row",flexWrap:"wrap",gap:10,marginBottom:16},card:{backgroundColor:"#111116",borderColor:"#24242B",borderWidth:1,borderRadius:18,padding:16,marginBottom:10},module:{width:"48%",minHeight:145},iconBubble:{width:38,height:38,borderRadius:12,backgroundColor:"#1B1B23",alignItems:"center",justifyContent:"center",marginBottom:13},moduleTitle:{color:"#fff",fontWeight:"750",fontSize:15},moduleDesc:{color:"#777781",fontSize:12,lineHeight:17,marginTop:4},live:{color:"#A78BFA",fontSize:10,fontWeight:"900",letterSpacing:1.5},eventTitle:{color:"#fff",fontSize:21,fontWeight:"800",marginTop:8,marginBottom:5},row:{flexDirection:"row",alignItems:"center"},link:{color:"#fff",fontWeight:"800",marginRight:7},pageTitle:{color:"#fff",fontSize:31,fontWeight:"850",letterSpacing:-1,marginTop:8},aiBox:{backgroundColor:"#111116",borderWidth:1,borderColor:"#292932",borderRadius:24,padding:20,marginVertical:22},aiBig:{color:"#fff",fontSize:21,fontWeight:"800",marginTop:12,marginBottom:3},input:{marginTop:12,backgroundColor:"#09090D",borderColor:"#27272F",borderWidth:1,borderRadius:14,color:"#fff",padding:14,fontSize:14},tool:{flexDirection:"row",alignItems:"center",gap:12},gameHero:{backgroundColor:"#15101E",borderWidth:1,borderColor:"#38264F",borderRadius:24,padding:22,marginVertical:22},gameIcon:{width:44,height:44,borderRadius:13,backgroundColor:"#1B1B22",alignItems:"center",justifyContent:"center",marginRight:2},play:{color:"#A78BFA",fontWeight:"900",fontSize:11,letterSpacing:1},postBox:{marginTop:10},signOut:{marginTop:20,backgroundColor:"#17171D",padding:16,borderRadius:16,flexDirection:"row",alignItems:"center",justifyContent:"center",gap:8},signOutText:{color:"#fff",fontWeight:"800"},back:{position:"absolute",bottom:25,left:20,right:20,backgroundColor:"#17171D",padding:16,borderRadius:16,flexDirection:"row",alignItems:"center",gap:9},backText:{color:"#fff",fontWeight:"700"},nav:{position:"absolute",bottom:0,left:0,right:0,height:82,backgroundColor:"#0C0C10",borderTopWidth:1,borderTopColor:"#202027",flexDirection:"row",justifyContent:"space-around",alignItems:"center",paddingBottom:7},navItem:{alignItems:"center",justifyContent:"center",minWidth:52},navText:{color:"#666",fontSize:9,marginTop:4,fontWeight:"700"},navActive:{color:"#fff"}
});
