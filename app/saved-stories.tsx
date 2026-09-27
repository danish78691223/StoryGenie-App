// app/saved-stories.tsx
// @ts-nocheck

import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Animated, Easing, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

export default function SavedStories(){
  const router=useRouter();
  const [stories,setStories]=useState([]);
  const [loading,setLoading]=useState(true);
  const intro=useRef(new Animated.Value(0)).current;

  useEffect(()=>{loadStories();},[]);
  useEffect(()=>{if(!loading)Animated.timing(intro,{toValue:1,duration:650,easing:Easing.out(Easing.cubic),useNativeDriver:true}).start();},[loading]);

  const loadStories=async()=>{
    try{
      const savedData=await AsyncStorage.getItem("savedStories");
      const parsed=savedData?JSON.parse(savedData):[];
      setStories(parsed.reverse());
    }catch(err){console.log("Load error:",err);}
    finally{setLoading(false);}
  };

  const clearAll=async()=>{await AsyncStorage.removeItem("savedStories");setStories([]);};

  if(loading)return <LinearGradient colors={["#0D1028","#30205E"]} style={styles.loader}><ActivityIndicator size="large" color="#FFF"/><Text style={styles.loaderText}>Opening your story shelf...</Text></LinearGradient>;

  return <View style={styles.container}>
    <View pointerEvents="none" style={styles.glowOne}/><View pointerEvents="none" style={styles.glowTwo}/>
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
      <Animated.View style={{opacity:intro,transform:[{translateY:intro.interpolate({inputRange:[0,1],outputRange:[25,0]})}]}}>
        <View style={styles.topBar}>
          <Pressable onPress={()=>router.back()} style={styles.backButton}><Ionicons name="arrow-back" size={20} color="#29263E"/></Pressable>
          <View style={styles.topCopy}><Text style={styles.eyebrow}>YOUR LIBRARY</Text><Text style={styles.heading}>Saved stories</Text></View>
          <View style={styles.countBadge}><Text style={styles.countText}>{stories.length}</Text></View>
        </View>
        <Text style={styles.subtitle}>Your little collection of worlds, characters and adventures.</Text>

        {stories.length===0&&<View style={styles.emptyBox}>
          <LinearGradient colors={["#F0ECFF","#EAF7FF"]} style={styles.emptyIcon}><Ionicons name="book-outline" size={34} color="#6D4CFF"/></LinearGradient>
          <Text style={styles.emptyTitle}>Your shelf is waiting</Text><Text style={styles.emptyText}>Create your first story and it will appear here.</Text>
          <Pressable style={styles.emptyButton} onPress={()=>router.push("/create-story")}><Text style={styles.emptyButtonText}>Create a story</Text><Ionicons name="arrow-forward" size={16} color="#FFF"/></Pressable>
        </View>}

        {stories.length>0&&<View style={styles.toolbar}>
          <View><Text style={styles.toolbarTitle}>Story shelf</Text><Text style={styles.toolbarSub}>{stories.length} {stories.length===1?"story":"stories"} saved</Text></View>
          <Pressable onPress={clearAll} style={styles.clearButton}><Ionicons name="trash-outline" size={16} color="#D45D6B"/><Text style={styles.clearText}>Clear</Text></Pressable>
        </View>}

        {stories.map((item,index)=><StoryCard key={item.id} item={item} index={index} onPress={async()=>{
          await AsyncStorage.setItem("currentStory",JSON.stringify(item));
          router.push({pathname:"/story-viewer",params:{character:item.character,storyType:item.storyType,ageGroup:item.ageGroup,language:item.language,fromSaved:"true"}});
        }}/>)}
      </Animated.View>
    </ScrollView>
  </View>;
}

function StoryCard({item,index,onPress}){
  const scale=useRef(new Animated.Value(1)).current;
  const image=item.paragraphs?.[0]?.image||item.images?.[0];
  return <Animated.View style={{transform:[{scale}],opacity:1-Math.min(index*.025,.15)}}>
    <Pressable onPressIn={()=>Animated.spring(scale,{toValue:.985,useNativeDriver:true}).start()} onPressOut={()=>Animated.spring(scale,{toValue:1,friction:7,useNativeDriver:true}).start()} onPress={onPress} style={styles.card}>
      {image?<Image source={{uri:image}} style={styles.thumbnail}/>:<LinearGradient colors={["#6D4CFF","#9A67FF"]} style={styles.thumbnailPlaceholder}><Ionicons name="sparkles" size={28} color="#FFF"/></LinearGradient>}
      <View style={styles.cardBody}>
        <View style={styles.cardTopRow}><View style={styles.typePill}><Text style={styles.typeText}>{item.storyType||"Story"}</Text></View><Ionicons name="chevron-forward" size={18} color="#AAA4B7"/></View>
        <Text style={styles.cardTitle} numberOfLines={2}>{item.title||item.character||"Untitled Story"}</Text>
        <View style={styles.cardMetaRow}><Ionicons name="language-outline" size={13} color="#8A839C"/><Text style={styles.cardMeta}>{item.language||"English"}</Text><View style={styles.metaDot}/><Text style={styles.cardMeta}>{item.paragraphs?.length||0} scenes</Text></View>
        <Text style={styles.date}>{item.date?new Date(item.date).toLocaleDateString():"Saved story"}</Text>
      </View>
    </Pressable>
  </Animated.View>;
}

const styles=StyleSheet.create({
  container:{flex:1,backgroundColor:"#F7F5FC"},glowOne:{position:"absolute",width:270,height:270,borderRadius:135,backgroundColor:"rgba(109,76,255,.08)",top:-110,right:-100},glowTwo:{position:"absolute",width:230,height:230,borderRadius:115,backgroundColor:"rgba(57,205,255,.07)",bottom:-80,left:-100},
  content:{padding:18,paddingTop:52,paddingBottom:44},topBar:{flexDirection:"row",alignItems:"center"},backButton:{width:43,height:43,borderRadius:14,backgroundColor:"#FFF",borderWidth:1,borderColor:"#E9E6F0",alignItems:"center",justifyContent:"center"},topCopy:{flex:1,marginLeft:12},eyebrow:{color:"#8A8499",fontSize:10,fontWeight:"900",letterSpacing:1.6},heading:{color:"#27243A",fontSize:28,fontWeight:"900",marginTop:2},countBadge:{minWidth:42,height:42,paddingHorizontal:10,borderRadius:15,backgroundColor:"#EEE9FF",alignItems:"center",justifyContent:"center"},countText:{color:"#6D4CFF",fontSize:14,fontWeight:"900"},
  subtitle:{color:"#858093",fontSize:13,lineHeight:20,marginTop:11,marginBottom:20,maxWidth:500},toolbar:{flexDirection:"row",alignItems:"center",justifyContent:"space-between",marginBottom:12},toolbarTitle:{color:"#3B364B",fontSize:15,fontWeight:"900"},toolbarSub:{color:"#9690A1",fontSize:11,marginTop:2},clearButton:{flexDirection:"row",alignItems:"center",gap:6,paddingHorizontal:11,paddingVertical:9,borderRadius:12,backgroundColor:"#FFF0F1",borderWidth:1,borderColor:"#FFDDE0"},clearText:{color:"#C65A68",fontSize:11,fontWeight:"900"},
  card:{flexDirection:"row",backgroundColor:"#FFF",borderRadius:22,padding:10,marginBottom:12,borderWidth:1,borderColor:"#ECE8F3",shadowColor:"#4E4665",shadowOpacity:.06,shadowRadius:18,shadowOffset:{width:0,height:7},elevation:2},thumbnail:{width:94,height:118,borderRadius:17,backgroundColor:"#EDEAF3"},thumbnailPlaceholder:{width:94,height:118,borderRadius:17,alignItems:"center",justifyContent:"center"},cardBody:{flex:1,paddingHorizontal:12,paddingVertical:5},cardTopRow:{flexDirection:"row",alignItems:"center",justifyContent:"space-between"},typePill:{alignSelf:"flex-start",backgroundColor:"#F0ECFF",borderRadius:999,paddingHorizontal:8,paddingVertical:5},typeText:{color:"#6D4CFF",fontSize:9,fontWeight:"900",letterSpacing:.6},cardTitle:{color:"#2D293D",fontSize:17,lineHeight:22,fontWeight:"900",marginTop:9},cardMetaRow:{flexDirection:"row",alignItems:"center",marginTop:9,gap:5},cardMeta:{color:"#8A8495",fontSize:10,fontWeight:"700"},metaDot:{width:3,height:3,borderRadius:2,backgroundColor:"#B5AFBF",marginHorizontal:2},date:{color:"#AAA4B3",fontSize:10,marginTop:7},
  emptyBox:{alignItems:"center",backgroundColor:"#FFF",borderRadius:26,padding:30,borderWidth:1,borderColor:"#ECE8F3",marginTop:10},emptyIcon:{width:82,height:82,borderRadius:28,alignItems:"center",justifyContent:"center",marginBottom:15},emptyTitle:{color:"#332E43",fontSize:21,fontWeight:"900"},emptyText:{color:"#8C8698",fontSize:13,textAlign:"center",lineHeight:20,marginTop:6,maxWidth:290},emptyButton:{marginTop:18,minHeight:45,paddingHorizontal:16,borderRadius:14,backgroundColor:"#6D4CFF",flexDirection:"row",alignItems:"center",gap:8},emptyButtonText:{color:"#FFF",fontSize:12,fontWeight:"900"},
  loader:{flex:1,alignItems:"center",justifyContent:"center"},loaderText:{color:"#D8D2EE",fontSize:13,marginTop:12}
});