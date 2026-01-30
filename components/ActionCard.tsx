import { Pressable, Text, View } from "react-native";

const ActionCard = ({ title, description, textButton, onPress }: { title: string, description: string, textButton: string, onPress: () => void }) => {
    return (
        <View className="w-full py-8 px-6 bg-blue-500 rounded-xl shadow-md dark:bg-blue-600 dark:shadow-blue-600">
            <Text className="text-xl font-bold text-white dark:text-white">{title}</Text>
            <View className="max-w-48 mt-2">
                <Text className="text-md w-max-24 text-white dark:text-white">{description}</Text>
            </View>
            <View className="flex-1 mt-4 justify-end items-end">
                <Pressable onPress={onPress} className="w-36 h-10 bg-white rounded-[12px] items-center justify-center">
                    <Text className="text-lg font-bold text-blue-500">{textButton}</Text>
                </Pressable>
            </View>
        </View>
    );
};


export default ActionCard;