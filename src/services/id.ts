import AsyncStorage from "@react-native-async-storage/async-storage";


export async function saveId(id : number) : Promise<number>{
    try{
        await AsyncStorage.setItem("userId", JSON.stringify(id));
        return id;
    }
    catch(e : any){
        throw new Error(`Failed to save user id : ${e.message}`);
    }
}